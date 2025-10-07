# Exemple d'action à ajouter dans MelangeViewSet (optionnel)

@action(detail=False, methods=['get'], url_path='disponibles-pour-stock')
def melanges_disponibles_pour_stock(self, request):
    """
    Retourner seulement les mélanges qui ne sont pas déjà utilisés 
    dans un suivi de stock
    """
    from core.models import SuiviStockPlateforme
    
    # IDs des mélanges déjà utilisés dans les suivis de stock
    melanges_utilises = SuiviStockPlateforme.objects.values_list('melange_id', flat=True).distinct()
    
    # Filtrer les mélanges disponibles
    melanges_disponibles = self.get_queryset().exclude(id__in=melanges_utilises)
    
    serializer = self.get_serializer(melanges_disponibles, many=True)
    return Response(serializer.data)