"use client";

import React from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('apiKeyModal.title')}</DialogTitle>
          <DialogDescription>
            {/* Optional: Add a brief description here if needed */}
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4 space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>{t('apiKeyModal.instructions1')}</li>
            <li>{t('apiKeyModal.instructions2')}</li>
            <li>{t('apiKeyModal.instructions3')}</li>
          </ol>
          
          <div className="mt-4 border rounded-md p-2 flex justify-center">
            <Image
              src="/images/getGlobalAPIKey.png" // This path is relative to the `public` directory
              alt="Cloudflare Global API Key location example"
              width={500} // Adjust as needed
              height={150} // Adjust as needed
              className="rounded-md object-contain"
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
