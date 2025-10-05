import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export function WhatsAppButton({ 
  phoneNumber, 
  message = "مرحباً", 
  className = "",
  size = "default" 
}: WhatsAppButtonProps) {
  const handleWhatsAppClick = () => {
    if (!phoneNumber) return;
    
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, ''); // إزالة كل شيء عدا الأرقام
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      size={size}
      className={`bg-green-500 hover:bg-green-600 text-white ${className}`}
      disabled={!phoneNumber}
    >
      <MessageCircle className="h-4 w-4 ml-2" />
      واتساب
    </Button>
  );
}