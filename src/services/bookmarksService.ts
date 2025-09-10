import { api } from './api';
import { Tool } from '../types/bridge/tool.types';
import { ApiResponse } from '../types/bridge/common.types';

export interface Bookmark {
  id: string;
  userId: string;
  toolId: string;
  tool: Tool;
  createdAt: string;
}

export interface CreateBookmarkDto {
  userId: string;
  toolId: string;
}

type FavoritesChangeListener = (favorites: Tool[]) => void;
type LoadingChangeListener = (isLoading: boolean) => void;

export class BookmarksService {
  private favorites: Tool[] = [];
  private isLoading: boolean = false;
  private currentUserId: string | null = null;
  private favoritesListeners: FavoritesChangeListener[] = [];
  private loadingListeners: LoadingChangeListener[] = [];

  // State management methods
  getFavorites(): Tool[] {
    return this.favorites;
  }

  getIsLoading(): boolean {
    return this.isLoading;
  }

  getFavoritesCount(): number {
    return this.favorites.length;
  }

  isFavorite(toolId: string): boolean {
    return this.favorites.some(tool => tool.id === toolId);
  }

  // Observer pattern for state changes
  onFavoritesChange(listener: FavoritesChangeListener): () => void {
    this.favoritesListeners.push(listener);
    return () => {
      this.favoritesListeners = this.favoritesListeners.filter(l => l !== listener);
    };
  }

  onLoadingChange(listener: LoadingChangeListener): () => void {
    this.loadingListeners.push(listener);
    return () => {
      this.loadingListeners = this.loadingListeners.filter(l => l !== listener);
    };
  }

  private notifyFavoritesChange() {
    this.favoritesListeners.forEach(listener => listener(this.favorites));
  }

  private notifyLoadingChange() {
    this.loadingListeners.forEach(listener => listener(this.isLoading));
  }

  private setLoading(loading: boolean) {
    if (this.isLoading !== loading) {
      this.isLoading = loading;
      this.notifyLoadingChange();
    }
  }

  private setFavorites(favorites: Tool[]) {
    this.favorites = favorites;
    this.notifyFavoritesChange();
  }

  // Initialize favorites for a user
  async initializeForUser(userId: string, verifiedEmail: boolean = true): Promise<void> {
    console.log('🔄 BookmarksService.initializeForUser - Initialisation pour userId:', userId, 'verifiedEmail:', verifiedEmail);
    
    if (this.currentUserId === userId) {
      console.log('🔄 BookmarksService.initializeForUser - Utilisateur déjà initialisé');
      return;
    }

    this.currentUserId = userId;

    if (!userId || !verifiedEmail) {
      console.log('🔄 BookmarksService.initializeForUser - Utilisateur non connecté ou non vérifié, reset favoris');
      this.setFavorites([]);
      return;
    }

    await this.loadUserFavorites(userId);
  }

  // Clear user data
  clearUserData(): void {
    console.log('🔄 BookmarksService.clearUserData - Nettoyage des données utilisateur');
    this.currentUserId = null;
    this.setFavorites([]);
    this.setLoading(false);
  }

  // Load user's favorites
  private async loadUserFavorites(userId: string): Promise<void> {
    console.log('🔄 BookmarksService.loadUserFavorites - Chargement favoris pour userId:', userId);
    
    try {
      this.setLoading(true);
      const bookmarks = await this.getUserBookmarks(userId);
      const tools = bookmarks.map(bookmark => bookmark.tool);
      console.log('✅ BookmarksService.loadUserFavorites - Favoris chargés:', tools.length, 'favoris');
      this.setFavorites(tools);
    } catch (error) {
      console.error('❌ BookmarksService.loadUserFavorites - Erreur:', error);
      this.setFavorites([]);
    } finally {
      this.setLoading(false);
    }
  }

  // Refresh favorites
  async refreshFavorites(): Promise<void> {
    if (this.currentUserId) {
      await this.loadUserFavorites(this.currentUserId);
    }
  }

  // Add tool to favorites with state update
  async addToFavorites(tool: Tool): Promise<void> {
    console.log('➕ BookmarksService.addToFavorites - Ajout favori tool:', tool.id, 'user:', this.currentUserId);
    
    if (!this.currentUserId) {
      throw new Error('User must be authenticated to add favorites');
    }

    try {
      await this.addBookmark(this.currentUserId, tool.id);
      
      // Update local state
      if (!this.favorites.some(fav => fav.id === tool.id)) {
        this.setFavorites([...this.favorites, tool]);
        console.log('✅ BookmarksService.addToFavorites - Favori ajouté au state local');
      }
    } catch (error) {
      console.error('❌ BookmarksService.addToFavorites - Erreur:', error);
      throw error;
    }
  }

  // Remove tool from favorites with state update
  async removeFromFavorites(toolId: string): Promise<void> {
    console.log('🗑️ BookmarksService.removeFromFavorites - Suppression favori toolId:', toolId, 'user:', this.currentUserId);
    
    if (!this.currentUserId) {
      throw new Error('User must be authenticated to remove favorites');
    }

    try {
      await this.removeBookmark(this.currentUserId, toolId);
      
      // Update local state
      this.setFavorites(this.favorites.filter(tool => tool.id !== toolId));
      console.log('✅ BookmarksService.removeFromFavorites - Favori supprimé du state local');
    } catch (error) {
      console.error('❌ BookmarksService.removeFromFavorites - Erreur:', error);
      throw error;
    }
  }
  // Get user's bookmarks
  async getUserBookmarks(userId: string): Promise<Bookmark[]> {
    console.log('🌐 BookmarksService.getUserBookmarks - Récupération favoris pour userId:', userId);
    try {
      const response = await api.get<ApiResponse<Bookmark[]>>(`/bookmarks/user/${userId}`);
      console.log('🌐 BookmarksService.getUserBookmarks - Réponse API:', response.data);
      const bookmarks = response.data.data;
      console.log('🌐 BookmarksService.getUserBookmarks - Favoris récupérés:', bookmarks.length, 'favoris');
      return bookmarks;
    } catch (error: any) {
      console.error('❌ BookmarksService.getUserBookmarks - Erreur:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch bookmarks');
    }
  }

  // Add tool to bookmarks
  async addBookmark(userId: string, toolId: string): Promise<Bookmark> {
    console.log('🌐 BookmarksService.addBookmark - Ajout favori userId:', userId, 'toolId:', toolId);
    try {
      const createBookmarkDto: CreateBookmarkDto = {
        userId,
        toolId
      };
      console.log('🌐 BookmarksService.addBookmark - DTO envoyé:', createBookmarkDto);
      const response = await api.post<ApiResponse<Bookmark>>('/bookmarks', createBookmarkDto);
      console.log('🌐 BookmarksService.addBookmark - Réponse API:', response.data);
      const bookmark = response.data.data;
      console.log('✅ BookmarksService.addBookmark - Favori ajouté avec succès:', bookmark);
      return bookmark;
    } catch (error: any) {
      console.error('❌ BookmarksService.addBookmark - Erreur:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to add bookmark');
    }
  }

  // Remove tool from bookmarks
  async removeBookmark(userId: string, toolId: string): Promise<void> {
    console.log('🌐 BookmarksService.removeBookmark - Suppression favori userId:', userId, 'toolId:', toolId);
    try {
      await api.delete<ApiResponse<{ message: string }>>(`/bookmarks/user/${userId}/tool/${toolId}`);
      console.log('✅ BookmarksService.removeBookmark - Favori supprimé avec succès');
    } catch (error: any) {
      console.error('❌ BookmarksService.removeBookmark - Erreur:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to remove bookmark');
    }
  }

  // Check if tool is bookmarked
  async isToolBookmarked(userId: string, toolId: string): Promise<boolean> {
    console.log('🌐 BookmarksService.isToolBookmarked - Vérification favori userId:', userId, 'toolId:', toolId);
    try {
      const bookmarks = await this.getUserBookmarks(userId);
      const isBookmarked = bookmarks.some(bookmark => bookmark.toolId === toolId);
      console.log('🌐 BookmarksService.isToolBookmarked - Résultat:', isBookmarked);
      return isBookmarked;
    } catch (error) {
      console.error('❌ BookmarksService.isToolBookmarked - Erreur:', error);
      return false;
    }
  }
}

export const bookmarksService = new BookmarksService();

// Hook for using bookmarks service in React components
export const useBookmarksService = () => {
  return {
    favorites: bookmarksService.getFavorites(),
    isLoading: bookmarksService.getIsLoading(),
    favoritesCount: bookmarksService.getFavoritesCount(),
    isFavorite: (toolId: string) => bookmarksService.isFavorite(toolId),
    addToFavorites: (tool: Tool) => bookmarksService.addToFavorites(tool),
    removeFromFavorites: (toolId: string) => bookmarksService.removeFromFavorites(toolId),
    refreshFavorites: () => bookmarksService.refreshFavorites(),
    initializeForUser: (userId: string, verifiedEmail?: boolean) => bookmarksService.initializeForUser(userId, verifiedEmail),
    clearUserData: () => bookmarksService.clearUserData(),
    onFavoritesChange: (listener: FavoritesChangeListener) => bookmarksService.onFavoritesChange(listener),
    onLoadingChange: (listener: LoadingChangeListener) => bookmarksService.onLoadingChange(listener)
  };
};