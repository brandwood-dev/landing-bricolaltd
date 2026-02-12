
import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CategoriesSection from '@/components/CategoriesSection';
import FeaturedToolsSection from '@/components/FeaturedToolsSection';
import RentalProcess from '@/components/RentalProcess';
import CustomerReviews from '@/components/CustomerReviews';
import BlogSection from '@/components/BlogSection';
import MobileAppSection from '@/components/MobileAppSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <CategoriesSection />
        <FeaturedToolsSection />
        <RentalProcess />
        <CustomerReviews />
        <BlogSection />
        <MobileAppSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
