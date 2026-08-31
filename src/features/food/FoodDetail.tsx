import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { fetchDishById } from "../../services/dishApi";
import { fetchReviewsByFoodId, submitReview } from "../../services/reviewApi";
import LoginModal from "../../components/LoginModal";
import {
  ChevronDown,
  Star,
  MapPin,
  Clock,
  Heart,
  ArrowLeft,
  Share2,
  UtensilsCrossed,
  X,
  ExternalLink,
} from "lucide-react";
import type { Food } from "../../types/food";
import type { Review } from "../../types/review";

interface MapModalProps {
  place: { name: string; address: string; mapsUrl: string };
  onClose: () => void;
}

// ─── Helper: Format teks dengan italic otomatis untuk bahasa asing ───────────
// Mendeteksi:
// 1. Markdown italic: *teks* atau _teks_
// 2. Skrip non-Latin: Arab, CJK (Mandarin/Jepang/Korea), Hangul, Devanagari, Thai
const FOREIGN_SCRIPT_REGEX =
  /[\p{Script=Arabic}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Devanagari}\p{Script=Thai}\p{Script=Bengali}\p{Script=Tamil}\p{Script=Telugu}\p{Script=Gujarati}\p{Script=Gurmukhi}\p{Script=Myanmar}\p{Script=Khmer}\p{Script=Lao}\p{Script=Tibetan}]+/u;

const MARKDOWN_ITALIC_REGEX = /(\*[^*\n]+\*|_[^_\n]+_)/g;

function FormattedText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  if (!text) return null;

  // Split berdasarkan markdown italic markers
  const parts = text.split(MARKDOWN_ITALIC_REGEX);

  return (
    <>
      {parts.map((part, i) => {
        // Cek apakah ini markdown italic
        const isMarkdownItalic =
          (part.startsWith("*") && part.endsWith("*")) ||
          (part.startsWith("_") && part.endsWith("_") && part.length > 1);

        if (isMarkdownItalic) {
          const inner = part.slice(1, -1);
          return (
            <em
              key={i}
              className={`italic text-orange-700 font-medium not-italic ${className}`}
            >
              {inner}
            </em>
          );
        }

        // Cek apakah mengandung skrip asing
        if (FOREIGN_SCRIPT_REGEX.test(part)) {
          return (
            <em
              key={i}
              className={`italic text-orange-700 font-medium ${className}`}
            >
              {part}
            </em>
          );
        }

        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function MapModal({ place, onClose }: MapModalProps) {
  const query = encodeURIComponent(`${place.name}, ${place.address}`);
  const embedUrl = `https://maps.google.com/maps?q=${query}&output=embed&hl=id`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-5 h-5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">
                <FormattedText text={place.name} />
              </p>
              <p className="text-xs text-white/80 truncate">
                <FormattedText text={place.address} />
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            <a
              href={place.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-semibold transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Buka Maps
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 relative" style={{ minHeight: "400px" }}>
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: "400px", display: "block" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={place.name}
          />
        </div>

        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-gray-500">📍 Klik pin di peta untuk petunjuk arah</p>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FoodDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToFavorites, favorites } = useApp();
  const { isAuthenticated, user } = useAuth();

  const [food, setFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [loginIntent, setLoginIntent] = useState<"favorite" | "review" | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    deskripsi: true,
  });
  const [mapModal, setMapModal] = useState<{
    name: string;
    address: string;
    mapsUrl: string;
  } | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetchDishById(id)
      .then(setFood)
      .catch((e: unknown) => console.error("Error fetching dish:", e))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) {
      setReviewsLoading(false);
      return;
    }
    fetchReviewsByFoodId(id)
      .then(setReviews)
      .catch((e: unknown) => console.error("Error fetching reviews:", e))
      .finally(() => setReviewsLoading(false));
  }, [id]);

  const isFavorite = food ? favorites.includes(food.id) : false;
  const hasReviews = reviews.length > 0;
  const avgRating = hasReviews
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  function handleFavoriteClick() {
    if (!food) return;
    if (isAuthenticated) addToFavorites(food.id);
    else {
      setLoginIntent("favorite");
      setShowLogin(true);
    }
  }

  function handleWriteReviewClick() {
    if (isAuthenticated && user) {
      setShowReviewForm(true);
      setTimeout(() => {
        document.getElementById("ulasan-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    } else {
      setLoginIntent("review");
      setShowLogin(true);
    }
  }

  function handleLoginSuccess() {
    setShowLogin(false);
    if (loginIntent === "favorite" && food) addToFavorites(food.id);
    else if (loginIntent === "review") {
      setShowReviewForm(true);
      setTimeout(
        () =>
          document.getElementById("ulasan-section")?.scrollIntoView({ behavior: "smooth", block: "center" }),
        100
      );
    }
    setLoginIntent(null);
  }

  async function handleSubmitReview() {
    if (!food || !user || !newComment.trim()) {
      console.error("Validasi gagal:", {
        food: !!food,
        user: !!user,
        hasComment: !!newComment.trim(),
      });
      return;
    }

    setSubmitting(true);
    try {
      const userName = user.name || user.username || user.user_name || "User";

      const created = await submitReview({
        restaurant_id: Number(food.id),
        user_id: user.id,
        user_name: userName,
        user_avatar: user.avatar || user.user_avatar || null,
        rating: newRating,
        comment: newComment.trim(),
      });

      setReviews((prev) => [created, ...prev]);
      setNewComment("");
      setNewRating(5);
      setShowReviewForm(false);
    } catch (e: unknown) {
      console.error("Error submitting review:", e);
      alert("Gagal mengirim ulasan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-800 font-medium">Memuat detail kuliner...</p>
        </div>
      </div>
    );
  }

  if (!food)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Makanan tidak ditemukan
      </div>
    );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        {/* HERO SECTION */}
        <div className="relative h-[400px] md:h-[500px] overflow-hidden bg-gradient-to-br from-amber-200 to-orange-300">
          {food.image ? (
            <img
              src={food.image}
              alt={food.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-8xl opacity-30">🍽️</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-start">
            <button
              onClick={() => navigate(-1)}
              className="w-11 h-11 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all active:scale-95 group"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div className="flex gap-3">
              <button className="w-11 h-11 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all active:scale-95">
                <Share2 className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={handleFavoriteClick}
                className="w-11 h-11 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all active:scale-95"
              >
                <Heart
                  className={`w-5 h-5 transition-all ${isFavorite ? "fill-red-500 text-red-500 scale-110" : "text-gray-700"}`}
                />
              </button>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
            <div className="max-w-5xl mx-auto">
              <span className="inline-flex items-center px-3 py-1.5 bg-orange-500/95 backdrop-blur-md rounded-full text-xs font-bold mb-4 shadow-lg">
                <UtensilsCrossed className="w-3.5 h-3.5 mr-1.5" />
                {food.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">
                <FormattedText text={food.name} className="text-white" />
              </h1>
              <div className="flex items-center gap-4 text-sm">
                {hasReviews && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold">{avgRating}</span>
                    <span className="text-white/70">({reviews.length} ulasan)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="max-w-5xl mx-auto px-4 md:px-6 -mt-8 relative z-10 pb-40">
          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100 text-center">
              <div className="text-2xl mb-1">🍽️</div>
              <p className="text-xs text-gray-500 font-medium">Kategori</p>
              <p className="text-sm font-bold text-gray-800 truncate">{food.category}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100 text-center">
              <div className="text-2xl mb-1">⭐</div>
              <p className="text-xs text-gray-500 font-medium">Rating</p>
              <p className="text-sm font-bold text-gray-800">{avgRating || "N/A"}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100 text-center">
              <div className="text-2xl mb-1">💰</div>
              <p className="text-xs text-gray-500 font-medium">Harga</p>
              <p className="text-sm font-bold text-gray-800">Rp {(food.price / 1000).toFixed(0)}k</p>
            </div>
          </div>

          {/* ACCORDION SECTIONS */}
          <div className="space-y-3 mb-8">
            <AccordionSection
              title="Deskripsi"
              icon="📝"
              isOpen={expandedSections.deskripsi}
              onToggle={() => toggleSection("deskripsi")}
              defaultOpen
            >
              <p className="text-gray-600 leading-relaxed">
                <FormattedText text={food.description} />
              </p>
            </AccordionSection>

            {food.history && (
              <AccordionSection
                title="Sejarah"
                icon="🏛️"
                isOpen={expandedSections.sejarah}
                onToggle={() => toggleSection("sejarah")}
              >
                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                  <FormattedText text={food.history} />
                </p>
              </AccordionSection>
            )}

            {food.journey && (
              <AccordionSection
                title="Perjalanan & Akulturasi"
                icon="🗺️"
                isOpen={expandedSections.journey}
                onToggle={() => toggleSection("journey")}
              >
                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                  <FormattedText text={food.journey} />
                </p>
              </AccordionSection>
            )}

            <AccordionSection
              title="Bahan-bahan Utama"
              icon=""
              isOpen={expandedSections.ingredients}
              onToggle={() => toggleSection("ingredients")}
            >
              <div className="flex flex-wrap gap-2">
                {food.ingredients.map((item, i) => (
                  <span
                    key={i}
                    className="px-3 py-2 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 text-orange-800 rounded-xl text-sm font-medium shadow-sm"
                  >
                    <FormattedText text={item} />
                  </span>
                ))}
              </div>
            </AccordionSection>

            {food.spices && food.spices.length > 0 && (
              <AccordionSection
                title="Bumbu & Rempah Khas"
                icon="🫙"
                isOpen={expandedSections.spices}
                onToggle={() => toggleSection("spices")}
              >
                <div className="flex flex-wrap gap-2">
                  {food.spices.map((spice, i) => (
                    <span
                      key={i}
                      className="px-3 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 text-amber-800 rounded-xl text-sm font-medium shadow-sm"
                    >
                      <FormattedText text={spice} />
                    </span>
                  ))}
                </div>
              </AccordionSection>
            )}

            {food.nutrition && (
              <AccordionSection
                title="Informasi Nutrisi"
                icon="💊"
                isOpen={expandedSections.nutrition}
                onToggle={() => toggleSection("nutrition")}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <NutriBadge label="Kalori" value={food.nutrition.calories} color="from-red-500 to-red-600" />
                  <NutriBadge label="Lemak" value={food.nutrition.fat} color="from-yellow-500 to-orange-500" />
                  <NutriBadge label="Karbohidrat" value={food.nutrition.carbs} color="from-blue-500 to-blue-600" />
                  <NutriBadge label="Protein" value={food.nutrition.protein} color="from-green-500 to-emerald-600" />
                </div>
              </AccordionSection>
            )}

            {food.recommendedPlaces && food.recommendedPlaces.length > 0 && (
              <AccordionSection
                title="Rekomendasi Tempat"
                icon=""
                isOpen={expandedSections.places}
                onToggle={() => toggleSection("places")}
              >
                <div className="space-y-3">
                  {food.recommendedPlaces.map((place, i) => (
                    <div
                      key={i}
                      className="border border-gray-200 rounded-2xl p-4 hover:border-orange-300 hover:shadow-md transition-all bg-white"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-gray-800 flex-1 pr-3">
                          <FormattedText text={place.name} />
                        </h4>
                        <span className="flex items-center gap-1 text-orange-600 font-bold text-sm bg-orange-50 px-2.5 py-1 rounded-lg">
                          <Star className="w-3.5 h-3.5 fill-orange-500" /> {place.rating}
                        </span>
                      </div>
                      <div className="space-y-2 mb-3">
                        <p className="text-xs text-gray-500 flex items-start gap-2">
                          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-orange-500" />
                          <span>
                            <FormattedText text={place.address} />
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                          <Clock className="w-4 h-4 flex-shrink-0 text-orange-500" />
                          {place.hours}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setMapModal({
                            name: place.name,
                            address: place.address,
                            mapsUrl: place.mapsUrl,
                          })
                        }
                        className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg transition-all active:scale-95"
                      >
                        <MapPin className="w-4 h-4" /> Lihat di Peta
                      </button>
                    </div>
                  ))}
                </div>
              </AccordionSection>
            )}
          </div>

          {/* REVIEWS SECTION */}
          <div id="ulasan-section" className="bg-white rounded-3xl shadow-lg border border-orange-100 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 md:p-8 text-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
                    <Star className="w-6 h-6 fill-yellow-300 text-yellow-300" />
                    Ulasan Pengguna
                  </h2>
                  {avgRating ? (
                    <p className="text-white/90">
                      Rating <span className="font-bold text-white">{avgRating}</span> dari {reviews.length} ulasan
                    </p>
                  ) : (
                    <p className="text-white/90">Belum ada ulasan</p>
                  )}
                </div>
                <button
                  onClick={handleWriteReviewClick}
                  className="flex-shrink-0 px-6 py-3 bg-white text-orange-600 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <span>✏️</span> Tulis Ulasan
                </button>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {showReviewForm && isAuthenticated && (
                <div className="border-2 border-orange-200 rounded-2xl p-5 bg-orange-50/50 space-y-4 animate-fade-in">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Rating Anda:</p>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="text-3xl transition-all hover:scale-110"
                        >
                          {star <= newRating ? "⭐" : "☆"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Bagaimana pengalaman Anda? Ceritakan di sini..."
                    rows={4}
                    className="w-full rounded-xl border border-gray-200 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
                  />
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowReviewForm(false)}
                      className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSubmitReview}
                      disabled={submitting || !newComment.trim()}
                      className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                    >
                      {submitting ? "Mengirim..." : "Kirim Ulasan"}
                    </button>
                  </div>
                </div>
              )}

              {reviewsLoading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Memuat ulasan...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <div className="text-5xl mb-3">💬</div>
                  <p className="text-gray-500 font-medium">Belum ada ulasan</p>
                  <p className="text-gray-400 text-sm mt-1">Jadilah yang pertama memberikan penilaian!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {reviews.map((review, index) => (
                    <div key={review.id || index} className="border-b border-gray-100 last:border-0 pb-5 last:pb-0">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-lg font-bold text-white flex-shrink-0 shadow-md">
                          {review.user_avatar ? (
                            <img
                              src={review.user_avatar}
                              alt={review.user_name || "User"}
                              className="w-12 h-12 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                e.currentTarget.parentElement!.textContent = (review.user_name || "U").charAt(0).toUpperCase();
                              }}
                            />
                          ) : (
                            (review.user_name || "U").charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-bold text-gray-800">
                                <FormattedText text={review.user_name || "Anonymous"} />
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex text-yellow-400 text-sm">
                                  {"★".repeat(review.rating || 0)}
                                  {"☆".repeat(5 - (review.rating || 0))}
                                </div>
                                {review.is_verified_purchase ? (
                                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                    Terverifikasi
                                  </span>
                                ) : null}
                              </div>
                            </div>
                            <span className="text-xs text-gray-400">
                              {review.visited_date ||
                                (review.created_at ? new Date(review.created_at).toLocaleDateString("id-ID") : "Baru saja")}
                            </span>
                          </div>
                          <p className="text-gray-600 leading-relaxed text-sm">
                            <FormattedText text={review.comment} />
                          </p>

                          {review.reply_from_owner && (
                            <div className="mt-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 text-sm border-l-4 border-orange-400">
                              <p className="font-bold text-orange-800 mb-1 text-xs uppercase tracking-wide">Balasan Pemilik</p>
                              <p className="text-gray-700">
                                <FormattedText text={review.reply_from_owner} />
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onSuccess={handleLoginSuccess} />
      {mapModal && <MapModal place={mapModal} onClose={() => setMapModal(null)} />}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #f97316, #f59e0b); border-radius: 10px; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </>
  );
}

function AccordionSection({
  title,
  icon,
  isOpen,
  onToggle,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden ${isOpen ? "border-orange-300 shadow-md" : "border-gray-200 hover:border-orange-200"}`}
    >
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <h2 className="text-base md:text-lg font-bold text-gray-800">{title}</h2>
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isOpen ? "bg-orange-100 rotate-180" : "bg-gray-100"}`}>
          <ChevronDown className="w-5 h-5 text-orange-600" />
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 pt-1 border-t border-gray-100 animate-fade-in bg-gradient-to-b from-white to-gray-50/50">
          {children}
        </div>
      )}
    </div>
  );
}

function NutriBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-4 text-center text-white shadow-lg transform hover:scale-105 transition-transform`}>
      <p className="text-[11px] font-bold uppercase tracking-wider opacity-90 mb-1.5">{label}</p>
      <p className="font-bold text-lg">{value}</p>
    </div>
  );
}
