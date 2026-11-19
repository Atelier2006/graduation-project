from django.contrib import admin
from django.urls import include, path

admin.site.site_header = "詐欺シミュ 管理画面"
admin.site.site_title = "詐欺シミュ 管理"
admin.site.index_title = "シナリオ・テスト・記録の管理"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("accounts/", include("accounts.urls")),
    path("test/", include("quiz.urls")),
    path("", include("sim.urls")),
]
