import { useState, useEffect } from 'react';
import { bookmarksService, useBookmarksService } from '@/services/bookmarksService';
import { Tool } from '@/services/toolsService';
import { useAuth } from '@/contexts/AuthContext';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Tool[]>(bookmarksService.getFavorites());
  const [isLoading, setIsLoading] = useState<boolean>(bookmarksService.getIsLoading());
  const { user, isAuthenticated } = useAuth();

  // Subscribe to service state changes
  useEffect(() => {
    const unsubscribeFavorites = bookmarksService.onFavoritesChange(setFavorites);
    const unsubscribeLoading = bookmarksService.onLoadingChange(setIsLoading);

    return () => {
      unsubscribeFavorites();
      unsubscribeLoading();
    };
  }, []);

  // Initialize service when user changes
  useEffect(() => {
    if (user && isAuthenticated) {
      bookmarksService.initializeForUser(user.id, user.verifiedEmail);
    } else {
      bookmarksService.clearUserData();
    }
  }, [user?.id, user?.verifiedEmail, isAuthenticated]);

  return {
    favorites,
    isLoading,
    favoritesCount: favorites.length,
    isFavorite: (toolId: string) => bookmarksService.isFavorite(toolId),
    addToFavorites: (tool: Tool) => bookmarksService.addToFavorites(tool),
    removeFromFavorites: (toolId: string) => bookmarksService.removeFromFavorites(toolId),
    refreshFavorites: () => bookmarksService.refreshFavorites()
  };
};