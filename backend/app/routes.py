from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from . import db, bcrypt
from .models import Product, User, Review, Tip, FAQ, SocialMedia, Favorite, db
from datetime import datetime
from flask_cors import CORS

# ===================================
# CONFIGURAÇÃO DO BLUEPRINT E CORS
# ===================================
bp = Blueprint("routes", __name__)
CORS(bp, supports_credentials=True, origins=["http://localhost:5173"])

# ===================================
# FUNÇÕES AUXILIARES
# ===================================

def admin_required():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        return jsonify({"msg": "Acesso negado: apenas administradores"}), 403
    return None

def admin_7_required():
    user_id = get_jwt_identity()
    if str(user_id) != "7":
        return jsonify({"msg": "Acesso negado: apenas o administrador (ID 7)"}), 403
    return None

# ===================================
# ROTAS PÚBLICAS
# ===================================

@bp.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    print("Rota /products chamada")
    return jsonify({
        'message': 'Lista de produtos',
        'products': [
            {
                'id': p.id, 
                'name': p.name, 
                'price': p.price,
                'description': p.description,
                'type': p.type,
                'image_url': p.image_url,
                'video_url': p.video_url,
                'stock': p.stock} 
        for p in products]
    })

@bp.route('/products/<int:product_id>', methods=['GET'])
def get_product_by_id(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Produto não encontrado'}), 404

    return jsonify({
        'id': product.id,
        'name': product.name,
        'price': product.price,
        'description': product.description,
        'type': product.type,
        'image_url': product.image_url,
        'video_url': product.video_url,
        'stock': product.stock
    }), 200


@bp.route('/tips', methods=['GET'])
def get_tips():
    tips = Tip.query.all()
    print("Rota /tips chamada")
    return jsonify({
        'message': 'Lista de dicas',
        'tips': [{'id': t.id, 'title': t.title, 'content': t.content, 'category': t.category} 
                 for t in tips]
    })

@bp.route('/faqs', methods=['GET'])
def get_faqs():
    faqs = FAQ.query.all()
    print("Rota /faqs chamada")
    return jsonify({
        'message': 'Lista de FAQs',
        'faqs': [
            {
                'id': f.id,
                'question': f.question,
                'answer': f.answer
            } 
            for f in faqs
        ]
    })


# ===================================
# LOGIN E USUÁRIOS
# ===================================

@bp.route('/users', methods=['POST'])
def create_user():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    if not username or not email or not password or not name:
        return jsonify({'error': 'username, email, password e name são obrigatórios'}), 400

    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({'error': 'Usuário já existe'}), 400

    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, email=email, password_hash=password_hash, name=name)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        'message': 'Usuário cadastrado com sucesso',
        'user': {'id': new_user.id, 'username': new_user.username, 'name': new_user.name}
    })


@bp.route('/login', methods=['POST'])
def login():
    if request.method == 'OPTIONS':
        response = jsonify({"msg": "CORS preflight ok"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        return response, 200
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'username e password são obrigatórios'}), 400

    user = User.query.filter_by(username=username).first()
    if user and bcrypt.check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            'message': 'Login bem-sucedido',
            'token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'name': user.name,
                'is_admin': user.is_admin
            }
        })
    return jsonify({'error': 'Credenciais inválidas'}), 401


# ===================================
# ADMIN: PRODUTOS (com CORS corrigido)
# ===================================

@bp.route('/admin/products', methods=['POST', 'OPTIONS'])
@jwt_required(optional=True)
def create_product():
    if request.method == 'OPTIONS':
        # 🔓 Resposta ao preflight CORS
        response = jsonify({"msg": "CORS preflight ok"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
        return response, 200

    # 🔒 Verifica admin
    admin_check = admin_required()
    if admin_check:
        return admin_check

    data = request.get_json()
    new_product = Product(
        name=data.get("name"),
        price=float(data.get("price", 0)),
        stock=int(data.get("stock", 0)),
        type=data.get("type"),
        description=data.get("description"),
        image_url=data.get("image_url"),
        video_url=data.get("video_url")
    )
    db.session.add(new_product)
    db.session.commit()

    response = jsonify({
        "message": "Produto criado com sucesso!",
        "product": {
            "id": new_product.id,
            "name": new_product.name,
            "price": new_product.price,
            "description": new_product.description,
            "type": new_product.type,
            "image_url": new_product.image_url,
            "video_url": new_product.video_url,
            "stock": new_product.stock
        }
    })
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    return response, 201

@bp.route('/admin/products/<int:product_id>', methods=['PUT', 'OPTIONS'])
@jwt_required(optional=True)
def update_product(product_id):
    if request.method == 'OPTIONS':
        response = jsonify({"msg": "CORS preflight ok"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
        return response, 200

    # 🔒 Verifica admin
    admin_check = admin_required()
    if admin_check:
        return admin_check

    data = request.get_json()
    product = Product.query.get(product_id)

    if not product:
        return jsonify({"error": "Produto não encontrado"}), 404

    if "name" in data: product.name = data["name"]
    if "price" in data: product.price = float(data["price"])
    if "description" in data: product.description = data["description"]
    if "type" in data: product.type = data["type"]
    if "image_url" in data: product.image_url = data["image_url"]
    if "video_url" in data: product.video_url = data["video_url"]
    if "stock" in data: product.stock = int(data["stock"])

    db.session.commit()

    response = jsonify({
        "message": "Produto atualizado com sucesso!",
        "product": {
            "id": product.id,
            "name": product.name,
            "price": product.price,
            "description": product.description,
            "type": product.type,
            "image_url": product.image_url,
            "video_url": product.video_url,
            "stock": product.stock
        }
    })
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    return response, 200

@bp.route('/admin/products/<int:product_id>', methods=['DELETE', 'OPTIONS'])
@jwt_required()
def delete_product(product_id):
    if request.method == 'OPTIONS':
        response = jsonify({"msg": "CORS preflight ok"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
        return response, 200

    admin_check = admin_required()
    if admin_check:
        return admin_check

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Produto não encontrado"}), 404

    db.session.delete(product)
    db.session.commit()

    response = jsonify({"message": "Produto excluído com sucesso!"})
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    return response, 200


# ===================================
# OUTRAS ROTAS ADMIN
# ===================================

@bp.route('/admin/tips', methods=['POST'])
@jwt_required()
def create_tip():
    admin_check = admin_required()
    if admin_check:
        return admin_check

    data = request.get_json()
    title = data.get('title')
    content = data.get('content')
    category = data.get('category')

    if not title or not content:
        return jsonify({'error': 'title e content são obrigatórios'}), 400

    new_tip = Tip(title=title, content=content, category=category)
    db.session.add(new_tip)
    db.session.commit()

    return jsonify({'message': 'Dica criada com sucesso', 'tip': {'id': new_tip.id, 'title': new_tip.title}})


@bp.route('/admin/faqs', methods=['POST'])
@jwt_required()
def create_faq():
    admin_check = admin_required()
    if admin_check:
        return admin_check

    data = request.get_json()
    question = data.get('question')
    answer = data.get('answer')

    if not question or not answer:
        return jsonify({'error': 'question e answer são obrigatórios'}), 400

    new_faq = FAQ(question=question, answer=answer)
    db.session.add(new_faq)
    db.session.commit()

    return jsonify({'message': 'FAQ criado com sucesso', 'faq': {'id': new_faq.id, 'question': new_faq.question}})

@bp.route('/admin/faqs/<int:faq_id>', methods=['DELETE', 'OPTIONS'])
@jwt_required()
def delete_faq(faq_id):
    if request.method == 'OPTIONS':
        response = jsonify({"msg": "CORS preflight ok"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
        return response, 200

    admin_check = admin_required()
    if admin_check:
        return admin_check

    faq = FAQ.query.get(faq_id)
    if not faq:
        return jsonify({"error": "FAQ não encontrado"}), 404

    db.session.delete(faq)
    db.session.commit()

    response = jsonify({"message": "FAQ deletado com sucesso"})
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    return response, 200


@bp.route('/admin/social-media', methods=['POST'])
@jwt_required()
def create_social_media():
    admin_check = admin_required()
    if admin_check:
        return admin_check

    data = request.get_json()
    platform = data.get('platform')
    url = data.get('url')

    if not platform or not url:
        return jsonify({'error': 'platform e url são obrigatórios'}), 400

    new_social = SocialMedia(platform=platform, url=url)
    db.session.add(new_social)
    db.session.commit()

    return jsonify({
        'message': 'Rede social adicionada com sucesso',
        'social_media': {'id': new_social.id, 'platform': new_social.platform, 'url': new_social.url}
    })

# ===================================
# FAVORITOS
# ===================================

def cors_response(msg="CORS preflight ok"):
    response = jsonify({"msg": msg})
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS")
    return response

@bp.route("/favorites", methods=["GET", "POST", "OPTIONS"])
@jwt_required()
def favorites():
    if request.method == "OPTIONS":
        return cors_response(), 200

    user_id = get_jwt_identity()
    if not user_id:
        return jsonify({"error": "Usuário não autenticado"}), 401

    try:
        if request.method == "POST":
            data = request.get_json()
            product_id = data.get("product_id")
            if not product_id:
                return jsonify({"error": "product_id é obrigatório"}), 400

            existing_fav = Favorite.query.filter_by(user_id=user_id, product_id=product_id).first()
            if existing_fav:
                return jsonify({"message": "Produto já favoritado"}), 200

            new_fav = Favorite(user_id=user_id, product_id=product_id, created_at=datetime.now())
            db.session.add(new_fav)
            db.session.commit()
            response = jsonify({"message": "Produto adicionado aos favoritos"})
            response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
            response.headers.add("Access-Control-Allow-Credentials", "true")
            return response, 201

        favorites = Favorite.query.filter_by(user_id=user_id).all()
        products = []
        for fav in favorites:
            product = Product.query.get(fav.product_id)
            if product:
                products.append({
                    "id": product.id,
                    "name": product.name,
                    "price": product.price,
                    "description": product.description,
                    "image_url": product.image_url,
                    "video_url": product.video_url,
                    "type": product.type,
                    "stock": product.stock
                })
        response = jsonify({"message": "Favoritos do usuário", "favorites": products})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response, 200

    except Exception as e:
        print("Erro em /favorites:", e)
        return jsonify({"error": "Erro ao processar favoritos"}), 500


@bp.route("/favorites/<int:product_id>", methods=["DELETE", "OPTIONS"])
@jwt_required()  # usuário deve estar logado
def remove_favorite(product_id):
    if request.method == "OPTIONS":
        return cors_response(), 200

    user_id = get_jwt_identity()
    if not user_id:
        return jsonify({"error": "Usuário não autenticado"}), 401

    try:
        fav = Favorite.query.filter_by(user_id=user_id, product_id=product_id).first()
        if not fav:
            return jsonify({"error": "Favorito não encontrado"}), 404

        db.session.delete(fav)
        db.session.commit()

        response = jsonify({"message": "Produto removido dos favoritos"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response, 200

    except Exception as e:
        print("Erro em /favorites/<id>:", e)
        return jsonify({"error": "Erro ao remover favorito"}), 500

# ===================================
# COMENTÁRIOS
# ===================================

@bp.route('/products/<int:product_id>/reviews', methods=['GET'])
def get_reviews(product_id):
    reviews = Review.query.filter_by(product_id=product_id).join(User).add_columns(
        Review.id,
        Review.user_id,
        User.name,
        Review.comment,
        Review.created_at).order_by(Review.created_at.desc()).all()
    review_list = [
        {
            "id": r.id,
            "user_id": r.user_id,
            "user_name": r.name,
            "comment": r.comment,
            "created_at": r.created_at.strftime('%d/%m/%Y %H:%M')
        }
        for r in reviews
    ]
    return jsonify(review_list), 200

@bp.route('/products/<int:product_id>/reviews', methods=['POST'])
def add_review(product_id):
    data = request.get_json()
    user_id = data.get('user_id')
    comment = data.get('comment')

    if not user_id:
        return jsonify({'error': 'Usuário não autenticado'}), 401

    if not comment:
        return jsonify({'error': 'Comentário é obrigatório'}), 400

    new_review = Review(
        product_id=product_id,
        user_id=user_id,
        comment=comment,
        created_at=datetime.utcnow()
    )
    db.session.add(new_review)
    db.session.commit()

    return jsonify({'message': 'Comentário adicionado com sucesso'}), 201

@bp.route('/products/<int:product_id>/reviews/<int:review_id>', methods=['DELETE'])
@jwt_required()
def delete_review(product_id, review_id):
    user_id = int(get_jwt_identity())
    review = Review.query.filter_by(id=review_id, product_id=product_id).first()

    if not review:
        return jsonify({"error": "Comentário não encontrado"}), 404

    if review.user_id != user_id:
        return jsonify({"error": "Não autorizado a deletar este comentário"}), 403

    db.session.delete(review)
    db.session.commit()
    return jsonify({"message": "Comentário deletado com sucesso"}), 200

# ===================================
# NOTAS
# ===================================

@bp.route('/products/<int:product_id>/rating', methods=['POST'])
@jwt_required()
def rate_product(product_id):
    user_id = int(get_jwt_identity())
    data = request.get_json()
    rating = data.get('rating')

    if rating is None or not (1 <= rating <= 5):
        return jsonify({'error': 'A nota deve ser entre 1 e 5'}), 400

    review = Review.query.filter_by(product_id=product_id, user_id=user_id).first()

    if review:
        review.rating = rating
        review.created_at = datetime.utcnow()
    else:
        review = Review(
            product_id=product_id,
            user_id=user_id,
            rating=rating,
            created_at=datetime.utcnow()
        )
        db.session.add(review)

    db.session.commit()
    return jsonify({'message': 'Nota registrada com sucesso'}), 200

@bp.route('/products/<int:product_id>/rating', methods=['GET'])
def get_product_rating(product_id):
    ratings = Review.query.filter_by(product_id=product_id).with_entities(Review.rating).all()
    if not ratings:
        return jsonify({'average': None, 'count': 0}), 200

    values = [r.rating for r in ratings if r.rating is not None]
    if not values:
        return jsonify({'average': None, 'count': 0}), 200

    avg = round(sum(values) / len(values), 1)
    return jsonify({'average': avg, 'count': len(values)}), 200

