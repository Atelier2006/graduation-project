"""記録の持ち主の見分け方。

会員はユーザーで、ログインしていない人はセッションに入れた印（ランダムな文字列）で見分ける。
Django はログインのときにセッションの鍵を作り直すが、中身は引き継ぐので、この印は残る。
ログインしたときに、その印の記録を会員のものにする（accounts.signals）。
"""
import uuid

from django.db.models import Q

KEY = "sim_anon"


def anon_token(request, create=True):
    token = request.session.get(KEY)
    if not token and create:
        token = uuid.uuid4().hex
        request.session[KEY] = token
    return token or ""


def owner_filter(request):
    """この人の記録だけを取り出す条件。"""
    if request.user.is_authenticated:
        return Q(user=request.user)
    token = anon_token(request, create=False)
    return Q(user__isnull=True, session_key=token) if token else Q(pk__in=[])


def owner_fields(request):
    """新しい記録に入れる持ち主の値。"""
    if request.user.is_authenticated:
        return {"user": request.user, "session_key": ""}
    return {"user": None, "session_key": anon_token(request)}


def is_owner(request, obj):
    if request.user.is_authenticated:
        return obj.user_id == request.user.id
    token = anon_token(request, create=False)
    return obj.user_id is None and bool(token) and obj.session_key == token
