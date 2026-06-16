"use client";

export default function ActionMapCanvasError() {
  return (
    <div className="flex h-full min-h-[320px] items-center justify-center rounded-xl border border-dashed border-red-200 bg-red-50 p-6 text-center">
      <div>
        <p className="font-semibold text-gray-800">Não foi possível carregar o mapa</p>
        <p className="mt-2 text-sm text-gray-600">
          Recarregue a página. Se o problema continuar, pare o servidor, apague a pasta{" "}
          <code>.next</code> e inicie novamente com <code>npm run dev</code>.
        </p>
      </div>
    </div>
  );
}
