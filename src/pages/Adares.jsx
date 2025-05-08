import FormularioData from '../api/FormulariosData';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';
import { Container, Row, Col, Button, Offcanvas } from 'react-bootstrap';
import '../styles/Andares.css';
import logo from '../img/logo.png';

import sala1Img from '../img/salas/sala1.png';
import sala2Img from '../img/salas/sala2.png';
import sala3Img from '../img/salas/sala3.png';
import sala4Img from '../img/salas/sala4.png';
import sala5Img from '../img/salas/sala5.png';
import sala6Img from '../img/salas/sala6.png';
import sala7Img from '../img/salas/sala7.png';
import sala8Img from '../img/salas/sala8.png';

const salasImgs = {
    1: sala1Img,
    2: sala2Img,
    3: sala3Img,
    4: sala4Img,
    5: sala5Img,
    6: sala6Img,
    7: sala7Img,
    8: sala8Img
};

import plantaSala1 from '../img/plantas/planta-sala-1.png';
import plantaSala2 from '../img/plantas/planta-sala-2.png';
import plantaSala3 from '../img/plantas/planta-sala-3.png';
import plantaSala4 from '../img/plantas/planta-sala-4.png';
import plantaSala5 from '../img/plantas/planta-sala-5.png';
import plantaSala6 from '../img/plantas/planta-sala-6.png';
import plantaSala7 from '../img/plantas/planta-sala-7.png';
import plantaSala8 from '../img/plantas/planta-sala-8.png';

const plantasImgs = {
    1: plantaSala1,
    2: plantaSala2,
    3: plantaSala3,
    4: plantaSala4,
    5: plantaSala5,
    6: plantaSala6,
    7: plantaSala7,
    8: plantaSala8
};

const salasCom = [
    705, 706, 707, 708, 801, 906, 907, 1001, 1105, 1206, 1307, 1308, 1408,
    1601, 603, 606, 607, 608, 808, 901, 903, 1007, 1008, 1106, 1108,
    1205, 1208, 1305, 1401, 1405, 1508
];



const Andares = () => {
    const [searchParams] = useSearchParams();
    const andarUrl = searchParams.get('andar');
    const [larguraTela, setLarguraTela] = useState(window.innerWidth);
    const [andarSelecionado, setAndarSelecionado] = useState('15° andar');
    const [salaSelecionada, setSalaSelecionada] = useState(1);
    const [mostrarMenu, setMostrarMenu] = useState(false);
    const [mostrarProposta, setMostrarProposta] = useState(false);
    const [mostrarDropdown, setMostrarDropdown] = useState(false);
    const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
    const [mostrarModalReserva, setMostrarModalReserva] = useState(false);
    const [mostrarModalContra, setMostrarModalContra] = useState(false);
    const [mostrarModalAgenda, setMostrarModalAgenda] = useState(false);
    const [mostrarModalValorizacao, setMostrarModalValorizacao] = useState(false);


    const andares = Array.from({ length: 15 }, (_, i) => `${19 - i}° andar`);

    useEffect(() => {
        if (andarUrl) setAndarSelecionado(`${andarUrl}° andar`);
    }, [andarUrl]);

    const salas = [
        { numero: 1, orientacao: 'FRENTE SUL', area: '67.61', preco: '743.710,00' },
        { numero: 2, orientacao: 'LATERAL SUL', area: '56.21', preco: '618.310,00' },
        { numero: 3, orientacao: 'LATERAL NORTE', area: '67.28', preco: '740.080,00' },
        { numero: 4, orientacao: 'FRENTE NORTE', area: '54.08', preco: '740.080,00' },
        { numero: 5, orientacao: 'LATERAL OESTE', area: '58.58', preco: '644.380,00' },
        { numero: 6, orientacao: 'FRENTE OESTE', area: '55.77', preco: '613.470,00' },
        { numero: 7, orientacao: 'LATERAL NORDESTE', area: '78.20', preco: '860.200,00' },
        { numero: 8, orientacao: 'FRENTE NORDESTE', area: '66.06', preco: '726.660,00' }
    ];


    const valorSala = parseFloat(salas[salaSelecionada - 1].preco.replace('.', '').replace(',', '.'));
    const valorGaragem = 60000;
    const descontoFixo = 36801.63;
    const valorTotalSemDesconto = valorSala + valorGaragem;
    const valorTotal = valorTotalSemDesconto - descontoFixo;
    const entrada = valorTotal * 0.30;
    const reforco2025 = valorTotal * 0.10;
    const reforco2026 = valorTotal * 0.10;
    const reforco2027 = valorTotal * 0.10;
    const valorParcelamento = valorTotal - (entrada + reforco2025 + reforco2026 + reforco2027);
    const parcelaCub = valorParcelamento / 55;

    const downloadProposta = () => {
        // TODO: ajustar URL de download
        window.location.href = `/api/download/proposta/${salaSelecionada}`;
    };

    const handlePropostaClick = () => {
        if (!mostrarDetalhes) {
            setMostrarProposta(true);
            setMostrarDetalhes(true);
        } else {
            downloadProposta();
            setMostrarProposta(false);
            setMostrarDetalhes(false);
        }
    };

    useEffect(() => {
        const handleResize = () => setLarguraTela(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);


    return (
        <div className="andares-page bg-white">
            <header className="ws-header py-3">
                <Container>
                    <Row className="align-items-center justify-content-between">
                        <Col xs="auto">
                            <Link to="/">
                                <img src={logo} alt="Wall Street Corporate" className="ws-logo-img" />
                            </Link>
                        </Col>

                        <Col xs="auto">
                            <div className="d-none d-md-flex justify-content-end align-items-center">
                                <Link to="/" className="ws-nav-link mx-3">INÍCIO</Link>
                                <a href="#" className="ws-nav-link mx-3">TOUR VIRTUAL</a>
                                <a href="#" className="ws-nav-link mx-3">CONTATO</a>
                                <Button
                                    as="a"
                                    href="https://front.wallstreetcorporate.com.br/folder-wall-street-corporate.pdf"
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ border: 'none', color: '#001A47' }}
                                    className="ws-pdf-button mx-3"
                                >
                                    BAIXAR PDF
                                </Button>
                            </div>

                            <div className="d-block d-md-none">
                                <Button
                                    onClick={() => setMostrarMenu(true)}
                                    style={{
                                        backgroundColor: 'transparent',
                                        border: '1px solid #ccc',
                                        color: '#6c757d',
                                        fontSize: '22px',
                                        padding: '6px 12px',
                                        lineHeight: 1,
                                        borderRadius: '8px'
                                    }}
                                >
                                    ☰
                                </Button>
                            </div>
                        </Col>
                    </Row>

                    <Offcanvas show={mostrarMenu} onHide={() => setMostrarMenu(false)} placement="top">
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title className="fw-bold">Menu</Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body className="d-flex flex-column p-3 text-center">
                            <Link to="/" className="btn btn-outline-dark mb-1 fw-semibold" onClick={() => setMostrarMenu(false)}>INÍCIO</Link>
                            <a href="#" className="btn btn-outline-dark mb-1 fw-semibold" onClick={() => setMostrarMenu(false)}>TOUR VIRTUAL</a>
                            <a href="#" className="btn btn-outline-dark mb-1 fw-semibold" onClick={() => setMostrarMenu(false)}>CONTATO</a>
                            <a
                                href="#"
                                className="btn fw-bold"
                                style={{ backgroundColor: '#FFAB52', color: '#001A47' }}
                                onClick={() => setMostrarMenu(false)}
                            >
                                BAIXAR PDF
                            </a>
                        </Offcanvas.Body>
                    </Offcanvas>
                </Container>
            </header>

            <Container fluid className="mt-4">
                <Row className="flex-column flex-md-row">
                    <Col md={2} className="border-end text-center">
                        <h2 className="text-center mb-4">ESCOLHA O SEU ANDAR</h2>
                        <div className="d-none d-md-flex flex-column">
                            {andares.map((andar, index) => (
                                <Button
                                    key={index}
                                    variant={andar === andarSelecionado ? 'dark' : 'outline-dark'}
                                    className="mb-2 text-start"
                                    onClick={() => setAndarSelecionado(andar)}
                                >
                                    {andar}
                                </Button>
                            ))}
                        </div>
                        <div className="d-flex d-md-none flex-wrap justify-content-center gap-2">
                            {andares.map((andar, index) => (
                                <Button
                                    key={index}
                                    size="sm"
                                    variant={andar === andarSelecionado ? 'dark' : 'outline-dark'}
                                    style={{ minWidth: '70px' }}
                                    onClick={() => setAndarSelecionado(andar)}
                                >
                                    {andar}
                                </Button>
                            ))}
                        </div>
                    </Col>


                    <Col md={5} className="px-3 mb-3 mb-md-0 position-relative">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <small className="text-muted d-block">{andarSelecionado}</small>
                                <h3 className="mb-0 fw-bold text-uppercase">Escolha<br /> sua sala</h3>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <span className="d-flex align-items-center gap-1">
                                    <i className="bi bi-check-circle-fill text-success"></i>
                                    <span className="fw-semibold text-dark mx-1">DISPONÍVEL </span>
                                </span>
                                <span className="d-flex align-items-center gap-1">
                                    <i className="bi bi-x-circle-fill text-danger"></i>
                                    <span className="fw-semibold text-dark mx-1">RESERVADO</span>
                                </span>
                            </div>
                        </div>

                        {larguraTela < 768 ? (
                            <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '20px' }}>
                                <div style={{ display: 'inline-flex', gap: '1rem', padding: '0 10px' }}>
                                    {salas.map((sala, index) => (
                                        <div
                                            key={index}
                                            className={`rounded-4 p-2 position-relative ${sala.numero === salaSelecionada ? 'border-dark border-4' : 'border-secondary border-3'}`}
                                            style={{
                                                background: '#DAE3F3',
                                                cursor: 'pointer',
                                                border: '4px solid #0046AD',
                                                width: '220px',
                                                flexShrink: 0
                                            }}
                                            onClick={() => {
                                                setSalaSelecionada(sala.numero)
                                                setMostrarProposta(false)
                                            }}
                                        >
                                            <div className="position-relative">
                                                <img
                                                    src={salasImgs[sala.numero]}
                                                    alt={`Sala ${sala.numero}`}
                                                    className="w-100 rounded mb-2"
                                                    style={{ width: '200px', objectFit: 'cover' }}

                                                />
                                                {(() => {
                                                    const andarNumero = parseInt(andarSelecionado);
                                                    const numeroSalaCompleto = parseInt(`${andarNumero}${sala.numero.toString().padStart(2, '0')}`);
                                                    const estaDisponivel = salasCom.includes(numeroSalaCompleto);

                                                    console.log('Verificando sala:', numeroSalaCompleto, 'Disponível?', estaDisponivel);

                                                    return (
                                                        <i
                                                            className={`bi fs-5 ${estaDisponivel ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'}`}
                                                            style={{ position: 'absolute', top: '10px', right: '10px' }}
                                                        />
                                                    );
                                                })()}


                                            </div>
                                            <div className="text-start">
                                                <div className="fw-bold">SALA {sala.numero}</div>
                                                <div className="text-uppercase small text-muted">{sala.orientacao}</div>
                                                <div className="fw-medium mt-1 mb-1">{sala.area} m²</div>
                                                <div className="fw-bold mb-1">R$ {sala.preco}</div>
                                                <hr className="my-2" />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setSalaSelecionada(sala.numero)
                                                        // setMostrarProposta(true)
                                                        setMostrarModalValorizacao(true)
                                                    }}
                                                    className="btn btn-link text-dark p-0 small"
                                                >
                                                    <i className="bi bi-exclamation-circle-fill me-1"></i>Mais informações
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="d-flex justify-content-center mt-2">
                                    {salas.map((_, i) => (
                                        <div key={i} style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            backgroundColor: salaSelecionada === i + 1 ? '#0046AD' : '#ccc',
                                            margin: '0 4px'
                                        }} />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <Row className="g-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(365px, 1fr))', gap: '1rem', marginBottom: '80px' }}>
                                {salas.map((sala, index) => (
                                    <Col key={index}>
                                        <div
                                            className={`rounded-4 p-2 h-100 d-flex align-items-stretch position-relative ${sala.numero === salaSelecionada ? 'border-dark border-4' : 'border-secondary border-3'}`}
                                            style={{
                                                background: '#DAE3F3',
                                                cursor: 'pointer',
                                                border: '4px solid #0046AD'
                                            }}
                                            onClick={() => {
                                                if (salaSelecionada !== sala.numero || mostrarProposta) {
                                                    setSalaSelecionada(sala.numero)
                                                    setMostrarProposta(false)
                                                }
                                            }}
                                        >
                                            <div className="d-flex align-items-center">
                                                <img
                                                    src={salasImgs[sala.numero]}
                                                    alt={`Sala ${sala.numero}`}
                                                    style={{ width: '200px', height: '120px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                                                    className="me-3"
                                                />
                                                <div className="flex-grow-1 text-start">
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <div>
                                                            <div className="fw-bold">SALA {sala.numero}</div>
                                                            <div className="text-uppercase small text-muted">{sala.orientacao}</div>
                                                        </div>
                                                        {(() => {
                                                            const andarNum = parseInt(andarSelecionado);
                                                            const numSala = parseInt(`${andarNum}${sala.numero.toString().padStart(2, '0')}`);
                                                            const estaDisp = salasCom.includes(numSala);
                                                            return (
                                                                <i
                                                                    className={`bi fs-4 ${estaDisp ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'}`}
                                                                    style={{ position: 'absolute', top: '-1px', right: '0.7rem' }}
                                                                />
                                                            );
                                                        })()}

                                                    </div>
                                                    <div className="mt-2 mb-2 fw-medium">{sala.area} m²</div>
                                                    <div className="fw-bold mb-2">R$ {sala.preco}</div>
                                                    {/* <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setSalaSelecionada(sala.numero)
                                                            setMostrarProposta(true)
                                                        }}
                                                        className="btn btn-link text-dark d-flex align-items-center gap-1 p-0 small"
                                                    >
                                                        <i className="bi bi-exclamation-circle-fill"></i>
                                                        Mais informações
                                                    </button> */}
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        )}


                        <div className="d-none d-md-block"
                            style={{
                                position: 'fixed',
                                bottom: 0,
                                left: '16.666667%',
                                width: '41.666667%',
                                padding: '0 1rem',
                                zIndex: 1051
                            }}>
                            <Button
                                onClick={() => {
                                    setMostrarDropdown(prev => !prev);
                                    // setMostrarProposta(prev => !prev);
                                }}
                                className="w-100 py-3 fw-bold text-dark d-flex justify-content-between align-items-center"
                                style={{
                                    backgroundColor: '#FFAB52',
                                    border: 'none',
                                    fontSize: '18px'
                                }}
                            >
                                ACESSAR PROPOSTA
                                <i className={`bi ${mostrarDropdown ? 'bi-chevron-down' : 'bi-chevron-up'}`}></i>
                            </Button>
                        </div>
                        <div className="d-block d-md-none"
                            style={{
                                position: 'fixed',
                                bottom: 0,
                                left: 0,
                                width: '100%',
                                padding: '0 1rem',
                                zIndex: 1051
                            }}>
                            <Button className="w-100 py-3 fw-bold text-dark d-flex justify-content-between align-items-center"
                                style={{ backgroundColor: '#FFAB52', border: 'none', fontSize: '18px' }}
                                onClick={() => {
                                    setMostrarDropdown(prev => !prev);
                                    // setMostrarProposta(prev => !prev);
                                }}>
                                ACESSAR PROPOSTA
                                <i className={`bi ${mostrarDropdown ? 'bi-chevron-down' : 'bi-chevron-up'}`}></i>
                            </Button>
                        </div>

                        <div className="d-none d-md-block">
                            <AnimatePresence>
                                {mostrarDropdown && (
                                    <div
                                        className="position-fixed top-0 start-0 w-100 h-100"
                                        style={{
                                            zIndex: 1050,
                                            background: 'transparent',
                                        }}
                                        onClick={() => {
                                            setMostrarDropdown(false);
                                            setMostrarProposta(false);
                                        }}
                                    >
                                        <motion.div
                                            initial={{ y: '100%' }}
                                            animate={{ y: 0 }}
                                            exit={{ y: '100%' }}
                                            transition={{ duration: 0.4 }}
                                            className="proposal-content-container p-4 bg-white shadow-lg rounded-top-4"
                                            style={{
                                                position: 'fixed',
                                                bottom: '56px',
                                                left: '16.666667%',
                                                width: '41.666667%',
                                                maxHeight: '75vh',
                                                overflowY: 'auto',
                                                zIndex: 1051
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button
                                                onClick={() => {
                                                    setMostrarDropdown(false);
                                                    setMostrarProposta(false);
                                                }}
                                                className="position-absolute top-0 end-0 m-3 btn btn-sm btn-outline-secondary"
                                            >
                                                <i className="bi bi-x"></i>
                                            </button>

                                            <h4 className="fw-bold text-center mb-4">PROPOSTA ABAIXO</h4>
                                            <div className="bg-dark text-white p-3 rounded text-center mb-3">
                                                <div className="fw-bold fs-5">WALL STREET CORPORATE</div>
                                                <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                                                    <Button
                                                        size="sm"
                                                        style={{
                                                            border: '1px solid white',
                                                            color: 'white',
                                                            backgroundColor: 'transparent',
                                                            padding: '0.25rem 0.6rem',
                                                            marginRight: '6px'
                                                        }}
                                                        onClick={() => salaSelecionada > 1 && setSalaSelecionada(salaSelecionada - 1)}
                                                    >
                                                        &lt;
                                                    </Button>
                                                    <div className="fw-bold text-white mx-1">
                                                        Sala Comercial {andarSelecionado.replace('° andar', '')}0{salaSelecionada}
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        style={{
                                                            border: '1px solid white',
                                                            color: 'white',
                                                            backgroundColor: 'transparent',
                                                            padding: '0.25rem 0.6rem',
                                                            marginLeft: '6px'
                                                        }}
                                                        onClick={() => salaSelecionada < salas.length && setSalaSelecionada(salaSelecionada + 1)}
                                                    >
                                                        &gt;
                                                    </Button>

                                                </div>

                                                <div>{salas[salaSelecionada - 1].area}m² de área privativa</div>
                                            </div>

                                            <table className="table table-sm mb-3">
                                                <tbody>
                                                    <tr><td>Valor da Sala</td><td className="text-end">R$ {valorSala.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
                                                    <tr><td>01 Vaga de garagem</td><td className="text-end">R$ 60.000,00</td></tr>
                                                    <tr className="fw-bold">
                                                        <td>Valor Total</td>
                                                        <td className="text-end">R$ {valorTotalSemDesconto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Desconto aplicado</td>
                                                        <td className="text-end text-success">- R$ {descontoFixo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    </tr>
                                                    <tr className="fw-bold">
                                                        <td>Valor Final</td>
                                                        <td className="text-end">R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    </tr>

                                                </tbody>
                                            </table>

                                            <h6 className="fw-bold text-center">Forma de Pagamento Sugerida</h6>
                                            <table className="table table-sm">
                                                <tbody>
                                                    <tr><td>Entrada</td><td className="text-end">R$ {entrada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
                                                    <tr><td>Dezembro 2025</td><td className="text-end">R$ {reforco2025.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
                                                    <tr><td>Dezembro 2026</td><td className="text-end">R$ {reforco2026.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
                                                    <tr><td>Dezembro 2027</td><td className="text-end">R$ {reforco2027.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
                                                    <tr><td>Valor Parcelamento</td><td className="text-end">R$ {valorParcelamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
                                                    <tr><td>55 Parcelas pelo CUB**</td><td className="text-end">R$ {parcelaCub.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
                                                    <tr className="fw-bold"><td>Total</td><td className="text-end">R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td></tr>
                                                </tbody>
                                            </table>

                                            <div className="text-center small">Entrega da Sala em Dezembro de 2027</div>

                                            <div className="d-flex justify-content-center w-100 small">

                                                <Button
                                                    type="button"
                                                    onClick={() => setMostrarModalValorizacao(true)}
                                                    style={{ backgroundColor: "white", border: "none" }}
                                                    className="text-dark d-flex align-items-center gap-1 p-0 small"
                                                >
                                                    <i className="bi bi-exclamation-circle-fill"></i>
                                                    Confira valorização
                                                </Button>
                                            </div>
                                            <div className="d-flex flex-column gap-2 mt-4">
                                                <FormularioData codigo="wall_street_pre_reserva" />
                                                <FormularioData codigo="wall_street_contraproposta" />
                                                <FormularioData codigo="wall_street_agendar_reuniao" />

                                                <AnimatePresence>
                                                    {mostrarModalValorizacao && (
                                                        <motion.div
                                                            className="position-fixed top-0 start-0 w-100 h-100"
                                                            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1060 }}
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                        >
                                                            <div
                                                                className="position-absolute top-50 start-50 translate-middle p-4"
                                                                style={{
                                                                    background: 'white',
                                                                    borderRadius: '20px',
                                                                    width: '90%',
                                                                    maxWidth: '600px',
                                                                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
                                                                }}
                                                            >
                                                                <h5 className="text-center fw-bold mb-3">VALORIZAÇÃO</h5>
                                                                <table className="table table-bordered">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>Valorização até Entrega*</td>
                                                                            <td className="fw-bold text-end">
                                                                                R$ {(valorSala * 1.7).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>Rendimento obtido (Lucro)*</td>
                                                                            <td className="fw-bold text-end">
                                                                                R$ {((valorSala * 1.7) - valorSala).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>Valor do Aluguel*</td>
                                                                            <td className="text-end">
                                                                                R$ {(valorTotalSemDesconto * 0.0095).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                                            </td>
                                                                        </tr>
                                                                        <tr><td>Valor Condomínio*</td><td className="text-end">R$ 800,00</td></tr>
                                                                        <tr><td>Valor IPTU* (12x)</td><td className="text-end">R$ 166,67</td></tr>
                                                                    </tbody>
                                                                </table>
                                                                <p className="small text-center text-muted">*Valores aproximados do mercado atual.</p>
                                                                <button
                                                                    onClick={() => setMostrarModalValorizacao(false)}
                                                                    className="btn btn-outline-secondary mt-3 d-block mx-auto"
                                                                >
                                                                    Fechar
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                                {(() => {
                                                    const andarNumero = parseInt(andarSelecionado);
                                                    const numeroSalaCompleto = parseInt(`${andarNumero}${salaSelecionada.toString().padStart(2, '0')}`);
                                                    const estaDisponivel = salasCom.includes(numeroSalaCompleto);
                                                    if (!estaDisponivel) return null;

                                                    return (
                                                        <Button
                                                            onClick={() => {
                                                                const nomeArquivo = `Sala ${numeroSalaCompleto} - WALL STREET CORPORATE.pdf`;
                                                                const url = `https://front.wallstreetcorporate.com.br/${encodeURIComponent(nomeArquivo)}`;
                                                                const link = document.createElement('a');
                                                                link.href = url;
                                                                link.download = nomeArquivo;
                                                                document.body.appendChild(link);
                                                                link.click();
                                                                document.body.removeChild(link);
                                                            }}
                                                            className="fw-bold text-dark"
                                                            style={{ backgroundColor: '#FFAB52', border: 'none' }}
                                                        >
                                                            BAIXAR PROPOSTA
                                                        </Button>
                                                    );
                                                })()}

                                            </div>

                                        </motion.div>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>


                        <div className="d-block d-md-none">
                            <AnimatePresence>
                                {mostrarDropdown && (
                                    <div
                                        className="position-fixed top-0 start-0 w-100 h-100"
                                        style={{ zIndex: 1050 }}
                                        onClick={() => {
                                            setMostrarDropdown(false);
                                            setMostrarProposta(false);
                                        }}
                                    >
                                        <motion.div
                                            initial={{ y: '100%' }}
                                            animate={{ y: 0 }}
                                            exit={{ y: '100%' }}
                                            transition={{ duration: 0.4 }}
                                            className="proposal-content-container p-4 shadow-lg rounded-top-4 bg-white"
                                            style={{
                                                position: 'fixed',
                                                bottom: '56px',
                                                left: 0,
                                                width: '100%',
                                                maxHeight: '75vh',
                                                overflowY: 'auto',
                                                zIndex: 1051
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button
                                                onClick={() => {
                                                    setMostrarDropdown(false);
                                                    setMostrarProposta(false);
                                                }}
                                                className="position-absolute top-0 end-0 m-3 btn btn-sm btn-outline-secondary"
                                            >
                                                <i className="bi bi-x"></i>
                                            </button>

                                            <h4 className="fw-bold text-center mb-4">PROPOSTA ABAIXO</h4>
                                            <div className="bg-dark text-white p-3 rounded text-center mb-3">
                                                <div className="fw-bold fs-5">WALL STREET CORPORATE</div>
                                                <div>Sala Comercial 160{salaSelecionada}</div>
                                                <div>{salas[salaSelecionada - 1].area}m² de área privativa</div>
                                            </div>

                                            <table className="table table-sm mb-3">
                                                <tbody>
                                                    <tr><td>Valor da Sala</td><td className="text-end">R$ {valorSala.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
                                                    <tr><td>01 Vaga de garagem</td><td className="text-end">R$ 60.000,00</td></tr>
                                                    <tr className="fw-bold"><td>Valor Total</td><td className="text-end">R$ {valorSala.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
                                                </tbody>
                                            </table>

                                            <h6 className="fw-bold text-center">Forma de Pagamento Sugerida</h6>
                                            <table className="table table-sm">
                                                <tbody>
                                                    <tr><td>Entrada</td><td className="text-end">R$ {entrada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
                                                    <tr><td>Dezembro 2025</td><td className="text-end">R$ {reforco2025.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
                                                    <tr><td>Dezembro 2026</td><td className="text-end">R$ {reforco2026.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
                                                    <tr><td>Dezembro 2027</td><td className="text-end">R$ {reforco2027.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
                                                    <tr><td>Valor Parcelamento</td><td className="text-end">R$ {valorParcelamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
                                                    <tr><td>55 Parcelas pelo CUB**</td><td className="text-end">R$ {parcelaCub.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
                                                    <tr className="fw-bold"><td>Total</td><td className="text-end">R$ {valorSala.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
                                                </tbody>
                                            </table>

                                            <div className="text-center small">Entrega da Sala em Dezembro de 2027</div>
                                        </motion.div>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>

                    </Col>

                    <Col md={5} className="px-0">
                        <AnimatePresence mode="wait">
                            {mostrarProposta ? (
                                <motion.div
                                    key="valorizacao"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -30 }}
                                    transition={{ duration: 0.4 }}
                                    className="d-flex flex-column align-items-center justify-content-start bg-light"
                                    style={{ height: '100vh', padding: '80px 20px 20px 20px', overflowY: 'auto' }}
                                >
                                    <h4 className="fw-bold text-center mb-3">VALORIZAÇÃO</h4>
                                    <table className="table table-bordered">
                                        <tbody>
                                            <tr>
                                                <td>Valorização até Entrega*</td>
                                                <td className="fw-bold text-end">
                                                    R$ {(valorSala * 1.7).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Rendimento obtido (Lucro)*</td>
                                                <td className="fw-bold text-end">
                                                    R$ {((valorSala * 1.7) - valorSala).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Valor do Aluguel*</td>
                                                <td className="text-end">--</td>
                                            </tr>

                                            <tr><td>Valor Condomínio*</td><td className="text-end">R$ 800,00</td></tr>
                                            <tr><td>Valor IPTU* (12x)</td><td className="text-end">R$ 166,67</td></tr>
                                        </tbody>
                                    </table>
                                    <p className="small text-center text-muted mb-2">*Valores aproximados do mercado atual.</p>
                                    <p className="small">
                                        Expectativa de Valorização de acordo com as Normas da ABNT, baseado no mercado atual.
                                        Sistema de análise conservador, preservando a garantia de liquidez dos investidores.
                                    </p>

                                    <div className="d-flex flex-column gap-2 w-100">
                                        <FormularioData codigo="wall_street_pre_reserva" />
                                        <FormularioData codigo="wall_street_contraproposta" />
                                        {estaDisp && (
                                            <>
                                                <Button
                                                    as="a"
                                                    href="https://front.wallstreetcorporate.com.br/proposta-wall-street.pdf"
                                                    download
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="fw-bold text-dark"
                                                    style={{ backgroundColor: '#FFAB52', border: 'none' }}
                                                >
                                                    BAIXAR PROPOSTA
                                                </Button>
                                            </>
                                        )}
                                        <FormularioData codigo="wall_street_agendar_reuniao" />
                                    </div>
                                    <p className="text-center mt-2 small text-muted">FAÇA O DOWNLOAD DA PROPOSTA E DA VALORIZAÇÃO</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="planta"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -30 }}
                                    transition={{ duration: 0.4 }}
                                    className="d-flex align-items-center justify-content-center bg-light"
                                    style={{ height: '100vh', overflowY: 'auto' }}

                                >
                                    <img
                                        src={plantasImgs[salaSelecionada]}
                                        alt={`Planta da Sala ${salaSelecionada}`}
                                        className="img-fluid"
                                        style={{ maxHeight: '100%', width: 'auto' }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Col>

                </Row>
            </Container >
        </div >
    );

};

export default Andares;