import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ProductDetails({ user }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState("");
  const navigate = useNavigate();

  const loadProductAndReviews = async () => {
    try {
      const productRes = await fetch(`http://localhost:5000/products/${id}`);
      const productData = await productRes.json();
      setProduct(productData);

      const reviewsRes = await fetch(`http://localhost:5000/products/${id}/reviews`);
      const reviewsData = await reviewsRes.json();
      setReviews(reviewsData);
    } catch (err) {
      console.error("Erro ao carregar produto e comentários:", err);
    }
  };

  useEffect(() => {
    loadProductAndReviews();
  }, [id]);

  const handleAddComment = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!comment.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/products/${id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user?.id, comment }),
      });

      if (res.ok) {
        setComment("");
        loadProductAndReviews();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao adicionar comentário");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao adicionar comentário");
    }
  };

  const handleDeleteComment = async (reviewId) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/products/${id}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== reviewId));
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao deletar comentário");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao deletar comentário");
    }
  };

  function RatingStars({ productId, user }) {
    const [selected, setSelected] = useState(0);
    const [average, setAverage] = useState(null);
    const token = localStorage.getItem("token");

    const loadAverage = async () => {
      try {
        const res = await fetch(`http://localhost:5000/products/${productId}/rating`);
        const data = await res.json();
        setAverage(data.average);
      } catch (err) {
        console.error("Erro ao carregar média:", err);
      }
    };

    useEffect(() => {
      loadAverage();
    }, [productId]);

    const handleRate = async (value) => {
      if (!user) {
        alert("Faça login para avaliar o produto");
        return;
      }

      setSelected(value);

      try {
        const res = await fetch(`http://localhost:5000/products/${productId}/rating`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ rating: value }),
        });

        const data = await res.json();
        if (!res.ok) {
          alert(data.error || "Erro ao registrar nota");
        } else {
          loadAverage();
        }
      } catch (err) {
        console.error(err);
        alert("Erro ao enviar nota");
      }
    };

    return (
      <div className="my-4">
        <h3 className="font-semibold mb-2">Avaliação</h3>
        <div>
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              onClick={() => handleRate(n)}
              style={{
                cursor: "pointer",
                color: n <= selected ? "#FFD700" : "#ccc",
                fontSize: "28px",
              }}
            >
              ★
            </span>
          ))}
        </div>
        {average && (
          <p className="text-sm text-gray-500 mt-1">
            Média atual: {average.toFixed(1)} / 5
          </p>
        )}
      </div>
    );
  }

  if (!product) return <p className="text-center">Carregando...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-2xl">
      <h2 className="text-3xl font-bold mb-2">{product.name}</h2>
      <p className="text-gray-600 mb-4">{product.description}</p>
      <p className="text-2xl font-semibold text-blue-600 mb-4">
        R$ {Number(product.price).toFixed(2)}/m²
      </p>

      <RatingStars productId={id} user={user} />

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-2">Deixe seu comentário</h3>
        <textarea
          className="w-full border rounded-lg p-2 mb-2"
          rows="3"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="O que achou do produto?"
        />
        <Button onClick={handleAddComment} className="bg-blue-600 text-white">
          Enviar
        </Button>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Comentários</h3>
        {reviews.length === 0 ? (
          <p className="text-gray-500">Nenhum comentário ainda.</p>
        ) : (
          reviews.map((r, i) => (
            <div key={i} className="border-b py-3 flex justify-between items-start">
              <div>
                <p className="font-semibold">{r.user_name}</p>
                <p className="text-gray-700">{r.comment}</p>
                <p className="text-sm text-gray-400">{r.created_at}</p>
              </div>
              {user?.id == r.user_id && (
                <button
                  onClick={() => handleDeleteComment(r.id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Deletar
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
