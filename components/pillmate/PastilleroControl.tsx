'use client';

import { useState } from 'react';

export default function PastilleroControl() {
  const [enviando, setEnviando] = useState(false);
  
  const enviarComando = async (comando: string) => {
    setEnviando(true);
    try {
      const res = await fetch('/api/esp32', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comando })
      });
      
      if (res.ok) {
        alert(`Comando ${comando} enviado`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setEnviando(false);
  };
  
  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Control del Pastillero</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => enviarComando('abrir')}
          disabled={enviando}
          className="bg-green-500 text-white p-3 rounded"
        >
          Abrir
        </button>
        
        <button
          onClick={() => enviarComando('cerrar')}
          disabled={enviando}
          className="bg-red-500 text-white p-3 rounded"
        >
          Cerrar
        </button>
        
        <button
          onClick={() => enviarComando('derecha')}
          disabled={enviando}
          className="bg-blue-500 text-white p-3 rounded"
        >
          Girar Derecha
        </button>
        
        <button
          onClick={() => enviarComando('izquierda')}
          disabled={enviando}
          className="bg-blue-700 text-white p-3 rounded"
        >
          Girar Izquierda
        </button>
      </div>
    </div>
  );
}