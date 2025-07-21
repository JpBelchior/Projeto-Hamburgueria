import React from "react";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-primary text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold">🍔 Hamburgueria Admin</h1>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card de teste */}
          <div className="card hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Big Burger
            </h3>
            <p className="text-gray-600 mb-4">
              Hambúrguer artesanal com carne bovina, queijo cheddar e molho
              especial.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-primary">R$ 25,90</span>
              <button className="btn-primary">Editar</button>
            </div>
          </div>

          {/* Card de estatísticas */}
          <div className="card bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Vendas Hoje</h3>
            <p className="text-3xl font-bold">R$ 1.247,50</p>
            <p className="text-blue-100">32 pedidos realizados</p>
          </div>

          {/* Formulário de teste */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Adicionar Produto
            </h3>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Nome do produto"
                className="input-field"
              />
              <input
                type="number"
                placeholder="Preço (R$)"
                className="input-field"
              />
              <select className="input-field">
                <option>Hambúrgueres</option>
                <option>Bebidas</option>
                <option>Acompanhamentos</option>
              </select>
              <button type="submit" className="btn-primary w-full">
                Adicionar Produto
              </button>
            </form>
          </div>
        </div>

        {/* Seção de botões */}
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Tailwind CSS funcionando! ✅
          </h2>
          <div className="space-x-4">
            <button className="btn-primary">Botão Primário</button>
            <button className="btn-secondary">Botão Secundário</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
