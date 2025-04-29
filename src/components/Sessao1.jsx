import React from 'react';
import { Button } from 'react-bootstrap';
import logoCompleto from '../img/logo.png';
import fundoHeader from '../img/fundoHeader.webp';
import predio1 from '../img/predio1.webp';
import iconeCirculo from '../img/iconeCirculo.webp';
import setas from '../img/setas.webp';
import './sessoes.css';



function Sessao1() {
  return (
    <section
      className="position-relative text-white pb-md-0 pb-0 pt-md-5 pt-5"
      style={{
        width: '100%',
        height: 'auto',
        minHeight: '935px',
        overflow: 'hidden',
        marginBottom: '0',
        marginTop: '-70px',
      }}
    >

      <div
        style={{
          backgroundImage: `url(${fundoHeader})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(5px)',
          opacity: 0.3,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          paddingTop: '40px',
          zIndex: 1,
        }}
      ></div>

      <div
        style={{
          backgroundColor: '#001A47',
          mixBlendMode: 'overlay',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
        }}
      ></div>

      <div className="container h-100" style={{ position: 'relative', zIndex: 3 }}>
        <div className="row h-100">
          <div className="col-md-6 d-flex flex-column justify-content-center align-items-md-start align-items-center text-md-start text-center">
            {/* DESKTOP: texto com seta acima */}

            <img
              src={logoCompleto}
              alt="Wall Street Corporate"
              className="logo-header"
            />


            <div className="d-none d-md-block align-self-end mb-5" style={{ textAlign: 'right' }}>
              <span
                style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  maxWidth: '300px',
                  display: 'block',
                  textAlign: 'left',
                  lineHeight: '1.2',

                }}
              >
                Selecione ao lado <br /> um andar.
              </span>
              <img
                src={setas}
                alt="Setas"
                style={{
                  maxWidth: '240px',
                  marginTop: '4px',
                  minHeight: '10px',
                  display: 'block',
                  marginRight: 'auto',
                }}
              />
            </div>
            <div className="d-flex flex-column align-items-center align-items-md-center mt-3" style={{ width: '100%' }}>
              <Button
                as="a"
                href="https://front.wallstreetcorporate.com.br/andares?andar=19"
                style={{ backgroundColor: '#FFAB52', border: 'none', color: '#001A47' }}
                className="fw-bold px-4 py-2 mb-2"
              >
                Escolha seu andar
              </Button>

              <Button
                as="a"
                href="https://front.wallstreetcorporate.com.br/folder-wall-street-corporate.pdf"
                download
                target="_blank"
                rel="noopener noreferrer"
                style={{ backgroundColor: '#FFAB52', border: 'none', color: '#001A47' }}
                className="fw-bold px-4 py-2"
              >
                Baixar PDF
              </Button>

            </div>

            {/* MOBILE: texto com seta oculta e espaçamento */}
            <div className="d-block d-md-none mt-4 mb-4">
              <span
                style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  display: 'block',
                  textAlign: 'center',
                  lineHeight: '1.2',
                  marginBottom: '20px',
                }}
              >
                Selecione abaixo <br /> um andar.
              </span>
            </div>
          </div>

          <div className="col-md-6 p-0 mt-5 d-flex align-items-end justify-content-md-start justify-content-center mb-md-0 mb-0">
            <div className="predio-container">
              <img src={predio1} alt="Prédio" style={{ width: '374px', height: '935px' }} />


              {Array.from({ length: 15 }).map((_, index) => {
                const andar = 19 - index;


                // distância base entre os andares
                const distancia = 36.9;

                // posição do topo
                let top = 90 + index * distancia;

                // ajuste específico para o 1º andar (última bolinha)
                if (andar === 5) {
                  top += 30;
                }


                return (
                  <button
                    key={andar}
                    className="botao-andar"
                    style={{ top: `${top}px`, left: '150px' }}
                    title={`${andar}º Andar`}
                    onClick={() => window.location.href = `/andares?andar=${andar}`}
                  >
                    <img src={iconeCirculo} alt={`${andar}º Andar`} className="icone-animado" />
                  </button>
                );
              })}



            </div>


          </div>
        </div>
      </div>
    </section>
  );
}

export default Sessao1;
