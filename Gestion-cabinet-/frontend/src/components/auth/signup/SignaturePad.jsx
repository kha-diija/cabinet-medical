'use client';
import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * Composant de signature par curseur utilisant Canvas.
 * @param {function} onSign - Callback appelé lorsque la signature est enregistrée (retourne une Data URL string).
 * @param {string} signatureData - Data URL existante à afficher
 */
export default function SignaturePad({ onSign, signatureData }) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const setupCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = 'hsl(var(--color-foreground))'; // couleur du trait selon thème
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (signatureData) {
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = signatureData;
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }, [signatureData]);

    useEffect(() => {
        setupCanvas();
    }, [setupCanvas]);

    const getPointerPos = (event) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clientX = event.touches ? event.touches[0].clientX : event.clientX;
        const clientY = event.touches ? event.touches[0].clientY : event.clientY;
        return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
    };

    const startDrawing = useCallback((event) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const { x, y } = getPointerPos(event);
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
        event.preventDefault();
    }, []);

    const draw = useCallback((event) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const { x, y } = getPointerPos(event);
        ctx.lineTo(x, y);
        ctx.stroke();
        event.preventDefault();
    }, [isDrawing]);

    const stopDrawing = useCallback(() => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (!canvas) return;

        // 🔥 RETOURNER LA DATA URL DIRECTEMENT (pas un File)
        const dataURL = canvas.toDataURL('image/png');
        onSign(dataURL);
    }, [onSign]);

    const clearSignature = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onSign(null);
    }, [onSign]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);

        canvas.addEventListener('touchstart', startDrawing, { passive: false });
        canvas.addEventListener('touchmove', draw, { passive: false });
        canvas.addEventListener('touchend', stopDrawing);

        return () => {
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mousemove', draw);
            canvas.removeEventListener('mouseup', stopDrawing);
            canvas.removeEventListener('mouseleave', stopDrawing);

            canvas.removeEventListener('touchstart', startDrawing);
            canvas.removeEventListener('touchmove', draw);
            canvas.removeEventListener('touchend', stopDrawing);
        };
    }, [startDrawing, draw, stopDrawing]);

    return (
        <div
            className="rounded-lg overflow-hidden border"
            style={{
                borderColor: 'hsl(var(--color-border))',
                backgroundColor: 'hsl(var(--color-card))',
            }}
        >
            <canvas
                ref={canvasRef}
                width={500}
                height={150}
                className="w-full cursor-crosshair"
                style={{
                    backgroundColor: 'hsl(var(--color-background))',
                    touchAction: 'none',
                }}
            />
            <div
                className="p-2 flex justify-end"
                style={{
                    borderTop: '1px solid hsl(var(--color-border))',
                    backgroundColor: 'hsl(var(--color-background-alt))',
                }}
            >
                <button
                    type="button"
                    onClick={clearSignature}
                    className="px-3 py-1 text-sm rounded"
                    style={{
                        color: 'hsl(var(--color-primary))',
                        backgroundColor: 'transparent',
                    }}
                >
                    Effacer la signature
                </button>
            </div>
        </div>
    );
}