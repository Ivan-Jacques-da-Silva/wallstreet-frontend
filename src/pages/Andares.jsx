import FormularioData   from '../api/FormulariosData';
import Salas            from './../api/Salas.jsx';
import React, { useState, useEffect }   from 'react';
import { motion, AnimatePresence }      from 'framer-motion';
import { useSearchParams, Link }        from 'react-router-dom';
import { Container, Row, Col, Button, Offcanvas } from 'react-bootstrap';
import '../styles/Andares.css';
import logo     from '../img/logo.png';
import Config   from '../Config';

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
    const [dadosProduto, setDadosProduto] = useState(null);
    const [mostrarProposta, setMostrarProposta] = useState(false);

    const andares = Array.from({ length: 15 }, (_, i) => `${19 - i}° andar`);

    useEffect(() => {
        if (andarUrl) setAndarSelecionado(`${andarUrl}° andar`);
    }, [andarUrl]);

    useEffect(() => {
        const handleResize = () => setLarguraTela(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const fetchProduto = async () => {
            try {
                const response = await fetch(`${Config.api_url}/api/produtos/1`);
                if (!response.ok) throw new Error('Erro ao buscar produto');
                const json = await response.json();
                setDadosProduto(json);
            } catch (err) {
                console.error('Erro:', err.message);
            }
        };
        fetchProduto();
    }, []);

    const variacoesAndares = dadosProduto?.produtos[0]?.variacoes || [];
    const andarAtual = variacoesAndares.find(v => v.atributos?.andar?.[0]?.valor === parseInt(andarSelecionado));
    const salasDinamicas = andarAtual?.variacoes || [];
    const salaAtual = salasDinamicas[salaSelecionada - 1];

    const valorSala = parseFloat(salaAtual?.precos?.de?.[0]?.valor || 0);
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
                <Row>
                    <Col xs={12} md={3} xl={2} className="px-2 col-andares">
                        <h2 className="text-center mb-4">ESCOLHA O SEU ANDAR</h2>
                        <div className="d-none d-xl-flex flex-column px-3">
                            {andares.map((andar, index) => (
                                <Button
                                    key={index}
                                    variant={andar === andarSelecionado ? 'dark' : 'outline-dark'}
                                    className="mb-1 text-start"
                                    onClick={() => setAndarSelecionado(andar)}
                                >
                                    {andar}
                                </Button>
                            ))}
                        </div>
                        <div className="d-flex d-xl-none flex-wrap justify-content-center gap-2">
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
                    <Col xs={12} md={9} xl={4} className="p-2 col-salas">
                        <div className="d-flex justify-content-between align-items-center mb-3 p-2">
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
                        <Salas
                            salas={salasDinamicas}
                            salaSelecionada={salaSelecionada}
                            setSalaSelecionada={setSalaSelecionada}
                            larguraTela={larguraTela}
                            andarSelecionado={andarSelecionado}
                            salasCom={salasCom}
                            setMostrarProposta={setMostrarProposta}
                        />
                    </Col>
                    <Col xs={12} md={6} xl={3} className="px-0 col-planta">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key="planta"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                transition={{ duration: 0.4 }}
                                className="d-flex align-items-start justify-content-center"
                                style={{ width: '100%', height: 'auto', overflowY: 'auto', zIndex: 1 }}
                            >
                                <img
                                    src={salaAtual?.arquivos?.plantas?.[0]?.baixar}
                                    alt={`Planta da Sala ${salaSelecionada}`}
                                    className="img-fluid w-100 px-3 planta-img"
                                    style={{ height: 'auto' }}
                                />
                            </motion.div>
                        </AnimatePresence>
                    </Col>
                    <Col xs={12} md={6} xl={3} className="px-0 col-proposta">
                        <div className="d-flex flex-column bg-light p-4 rounded" style={{ overflowY: 'auto' }}>
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ duration: 0.4 }}
                            >
                                <h4 className="fw-bold text-center mb-4">PROPOSTA ABAIXO</h4>
                                <div className="bg-dark text-white p-3 rounded text-center mb-3">
                                    <div className="fw-bold fs-5">WALL STREET CORPORATE</div>
                                    <div className="fw-bold text-white mt-2">
                                        Sala Comercial {andarSelecionado.replace('° andar', '')}0{salaSelecionada}
                                    </div>
                                    <div>{salaAtual?.atributos?.area?.[0]?.valor}m² de área privativa</div>
                                </div>
                                <table className="table table-sm mb-3">
                                    <tbody>
                                        <tr><td>Valor da Sala</td><td className="text-end">R$ {valorSala.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
                                        <tr><td>01 Vaga de garagem</td><td className="text-end">R$ 60.000,00</td></tr>
                                        <tr className="fw-bold"><td>Valor Total</td><td className="text-end">R$ {valorTotalSemDesconto.toLocaleString('pt-BR')}</td></tr>
                                        <tr><td>Desconto aplicado</td><td className="text-end text-success">- R$ {descontoFixo.toLocaleString('pt-BR')}</td></tr>
                                        <tr className="fw-bold"><td>Valor Final</td><td className="text-end">R$ {valorTotal.toLocaleString('pt-BR')}</td></tr>
                                    </tbody>
                                </table>
                                <h6 className="fw-bold text-center">Forma de Pagamento Sugerida</h6>
                                <table className="table table-sm">
                                    <tbody>
                                        <tr><td>Entrada</td><td className="text-end">R$ {entrada.toLocaleString('pt-BR')}</td></tr>
                                        <tr><td>Dezembro 2025</td><td className="text-end">R$ {reforco2025.toLocaleString('pt-BR')}</td></tr>
                                        <tr><td>Dezembro 2026</td><td className="text-end">R$ {reforco2026.toLocaleString('pt-BR')}</td></tr>
                                        <tr><td>Dezembro 2027</td><td className="text-end">R$ {reforco2027.toLocaleString('pt-BR')}</td></tr>
                                        <tr><td>Valor Parcelamento</td><td className="text-end">R$ {valorParcelamento.toLocaleString('pt-BR')}</td></tr>
                                        <tr><td>55 Parcelas pelo CUB**</td><td className="text-end">R$ {parcelaCub.toLocaleString('pt-BR')}</td></tr>
                                        <tr className="fw-bold"><td>Total</td><td className="text-end">R$ {valorTotal.toLocaleString('pt-BR')}</td></tr>
                                    </tbody>
                                </table>
                                <div className="d-flex flex-column gap-2 mt-4">
                                    <FormularioData codigo="wall_street_pre_reserva" />
                                    <FormularioData codigo="wall_street_contraproposta" />
                                    <FormularioData codigo="wall_street_agendar_reuniao" />



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
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Andares;
