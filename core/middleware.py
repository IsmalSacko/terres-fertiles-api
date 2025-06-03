from django.shortcuts import redirect
from django.urls import reverse
#'NAME': 'terres_fertiles',
class RedirectUnauthenticatedMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # On ne redirige que si l'utilisateur veut du HTML
        accept = request.META.get('HTTP_ACCEPT', '')
        is_html = 'text/html' in accept

        # Ne pas rediriger pour les appels API (ex: Postman, curl, Angular, etc.)
        if not is_html:
            return self.get_response(request)

        user = getattr(request, 'user', None)
        login_url = reverse('rest_framework:login')
        excluded_paths = [login_url, '/api/auth/logout/']

        if request.path.startswith('/api/auth') and (user is None or not user.is_authenticated):
            if request.path not in excluded_paths:
                return redirect(f"{login_url}?next={request.path}")

        return self.get_response(request)
