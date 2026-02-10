"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function TwitterDisconnectButton() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleDisconnect = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/twitter/disconnect', {
                method: 'POST',
            });
            
            if (response.ok) {
                router.refresh(); // Refresh the page to update UI
            } else {
                console.error('Failed to disconnect Twitter');
            }
        } catch (error) {
            console.error('Error disconnecting Twitter:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDisconnect}
            disabled={isLoading}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
        >
            {isLoading ? 'Disconnecting...' : 'Disconnect'}
        </Button>
    );
}
