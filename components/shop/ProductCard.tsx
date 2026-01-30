"use client";
import React from 'react';
import Link from 'next/link';

interface ProductCardProps {
  product: any;
  onClick?: (p: any) => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  // Logic to calculate discount
  const price = Number(product.price);
  const original = product.originalPrice ? Number(product.originalPrice) : 0;
  const hasDiscount = original > price;

  // 🛑 CHANGED: Only show badge if user manually entered discountLabel in Admin
  // Do NOT auto-calculate percentages
  const showBadge = product.discountLabel && product.discountLabel.trim() !== "";

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick(product);
    }
  };

  return (
    <Link 
      href={`/product/${product.id}`}
      onClick={handleClick}
      className="group flex flex-col bg-white border border-gray-100 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative"
    >
      {/* 1. IMAGE CONTAINER (SQUARE & WHITE) */}
      <div className="relative aspect-square w-full bg-white overflow-hidden rounded-t-xl border-b border-gray-50">
        <img 
          src={product.images && product.images.length > 0 ? product.images[0] : product.image} 
          alt={product.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Discount Badge - Only if manually set */}
        {showBadge && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-red-600 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-md shadow-sm animate-pulse">
              {product.discountLabel}
            </span>
          </div>
        )}
      </div>

      {/* 2. DETAILS (Compact) */}
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-gray-800 font-bold text-sm leading-tight mb-2 text-right line-clamp-2">
          {product.title}
        </h3>

        <div className="mt-auto flex flex-col items-end">
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              {original} DH
            </span>
          )}
          <span className="text-green-600 font-extrabold text-lg">
            {price} <span className="text-xs font-normal text-gray-500">DH</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
