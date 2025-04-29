// src/App.jsx
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Cabecalho from './components/Cabecalho.jsx';
import Hero from './components/Hero.jsx';
import Sessao2 from './components/Sessao2.jsx';
import Sessao3 from './components/Sessao3.jsx';
import Footer from './components/Footer.jsx';

function App() {
  return (
    <div className="w-100" style={{ backgroundColor: '#0e0e15' }}>
      <Cabecalho />
      <Hero />
      <Sessao2 />
      <Sessao3 />
      <Footer />
    </div>
  );
}

export default App;
