"use client";
import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export default function QrCode({ value, size = 200 }: { value: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, { width: size, margin: 1 }).catch(
        () => {}
      );
    }
  }, [value, size]);

  return <canvas ref={canvasRef} className="rounded-xl bg-white p-2" />;
}
