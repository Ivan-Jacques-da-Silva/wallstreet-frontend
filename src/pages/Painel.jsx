// src/pages/Painel.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Navbar, Nav, FloatingLabel } from 'react-bootstrap';
import sala1Img from '../img/salas/sala1.png';
import sala2Img from '../img/salas/sala2.png';
import sala3Img from '../img/salas/sala3.png';
import sala4Img from '../img/salas/sala4.png';

const Painel = () => {
    const andares = Array.from({ length: 15 }, (_, i) => 19 - i);
    const [andarSelecionado, setAndarSelecionado] = useState(15);
    const [salas, setSalas] = useState([]);
    const [formulario, setFormulario] = useState({ numero: '', orientacao: '', area: '', preco: '', status: 'disponivel', andar: 15, valorizacao: '', lucro: '', aluguel: '', condominio: '', iptu: '', imagem: null, imagemPlanta: null, imagemProposta: null });

    const imagens = [sala1Img, sala2Img, sala3Img, sala4Img, sala1Img, sala2Img, sala3Img, sala4Img];
    const dadosFixos = [
        { numero: 1, orientacao: 'FRENTE SUL', area: '67.61' },
        { numero: 2, orientacao: 'LATERAL SUL', area: '56.21' },
        { numero: 3, orientacao: 'LATERAL NORTE', area: '67.28' },
        { numero: 4, orientacao: 'FRENTE NORTE', area: '54.08' },
        { numero: 5, orientacao: 'LATERAL OESTE', area: '60.30' },
        { numero: 6, orientacao: 'FRENTE OESTE', area: '72.45' },
        { numero: 7, orientacao: 'LATERAL NORDESTE', area: '65.10' },
        { numero: 8, orientacao: 'FRENTE NORDESTE', area: '58.75' },
    ];

    useEffect(() => {
        const dados = dadosFixos.map((dado, i) => ({
            ...dado,
            preco: '',
            status: 'disponivel',
            img: imagens[i],
            andar: andarSelecionado
        }));
        setSalas(dados);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const nova = { ...formulario, img: sala1Img };
        setSalas([...salas, nova]);
        setFormulario({ numero: '', orientacao: '', area: '', preco: '', status: 'disponivel', andar: andarSelecionado, valorizacao: '', lucro: '', aluguel: '', condominio: '', iptu: '', imagem: null, imagemPlanta: null, imagemProposta: null });
    };

    const handleNumeroChange = (numero) => {
        const dados = dadosFixos.find(d => d.numero === Number(numero));
        setFormulario(f => ({
            ...f,
            numero: numero,
            orientacao: dados?.orientacao || '',
            area: dados?.area || ''
        }));
    };

    const filtradas = salas.filter(s => s.andar === andarSelecionado);

    return (
        <Container fluid className="p-0" style={{ backgroundColor: '#ffffff', minHeight: '100vh', color: '#001A47' }}>
            <Navbar expand="lg" className="shadow-sm px-4 py-3 mb-4" style={{ backgroundColor: '#001A47' }}>
                <Navbar.Brand className="fw-bold text-uppercase text-white">Painel Administrativo</Navbar.Brand>

                <Nav className="ms-auto d-flex align-items-center">
                    <Form.Select
                        value={andarSelecionado}
                        onChange={e => {
                            const val = Number(e.target.value);
                            setAndarSelecionado(val);
                            setFormulario(f => ({ ...f, andar: val }));
                        }}
                        className="me-3"
                    >
                        {andares.map(n => (
                            <option key={n} value={n}>{n}° andar</option>
                        ))}
                    </Form.Select>
                    <Form.Select
                        onChange={() => { }}
                        className="me-2"
                    >
                        <option value="">Todos</option>
                        <option value="disponivel">Disponíveis</option>
                        <option value="reservado">Reservados</option>
                    </Form.Select>
                </Nav>
            </Navbar>

            <Container className="pb-5">
                <Row>
                    <Col md={7}>
                        <Row className="align-items-center mb-3">
                            <Col><h2 className="m-0">SALAS DO ANDAR {andarSelecionado}</h2></Col>
                            <Col xs="auto">
                                <span className="me-3">
                                    <i className="bi bi-check-circle-fill text-success"></i> DISPONÍVEL
                                </span>
                                <span>
                                    <i className="bi bi-x-circle-fill text-danger"></i> RESERVADO
                                </span>
                            </Col>
                        </Row>

                        <Row className="g-3">
                            {filtradas.map(sala => (
                                <Col key={sala.numero} xs={12} md={6}>
                                    <Card style={{ borderRadius: '12px', border: '1px solid #ddd' }} className="h-100 shadow-sm">
                                        <Card.Body className="d-flex">
                                            <img
                                                src={sala.img}
                                                alt={`Sala ${sala.numero}`}
                                                style={{ width: '200px', height: '120px', objectFit: 'cover', borderRadius: '6px' }}
                                                className="me-3"
                                            />
                                            <div className="flex-grow-1">
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <div className="fw-bold">SALA {sala.numero}</div>
                                                        <div className="text-uppercase small text-muted">{sala.orientacao}</div>
                                                    </div>
                                                    <i className={`bi fs-4 ${sala.status === 'disponivel' ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'}`}></i>
                                                </div>
                                                <div className="mt-2 mb-2">{sala.area} m²</div>
                                                <div className="fw-bold mb-2">R$ {sala.preco}</div>
                                                <div className="text-dark d-flex align-items-center gap-1 small">
                                                    <i className="bi bi-info-circle"></i> Mais informações
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Col>

                    <Col md={5}>
                        <Card className="shadow-sm border-0" style={{ backgroundColor: '#f9f9f9', borderRadius: '12px' }}>
                            <Card.Body>
                                <h5 className="fw-bold text-uppercase mb-3">Cadastrar Sala</h5>
                                <Form onSubmit={handleSubmit}>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <FloatingLabel controlId="numero" label="Número da Sala">
                                                <Form.Select
                                                    value={formulario.numero}
                                                    onChange={e => handleNumeroChange(e.target.value)}
                                                    required
                                                >
                                                    <option value="">Selecione</option>
                                                    {[...Array(8)].map((_, i) => (
                                                        <option key={i + 1} value={i + 1}>Sala {i + 1}</option>
                                                    ))}
                                                </Form.Select>
                                            </FloatingLabel>
                                        </Col>
                                        <Col md={6}>
                                            <FloatingLabel controlId="orientacao" label="Orientação">
                                                <Form.Control value={formulario.orientacao} disabled />
                                            </FloatingLabel>
                                        </Col>
                                        <Col md={6}>
                                            <FloatingLabel controlId="area" label="Área (m²)">
                                                <Form.Control value={formulario.area} disabled />
                                            </FloatingLabel>
                                        </Col>
                                        <Col md={6}>
                                            <FloatingLabel controlId="preco" label="Preço">
                                                <Form.Control
                                                    value={formulario.preco}
                                                    onChange={e => setFormulario({ ...formulario, preco: e.target.value })}
                                                />
                                            </FloatingLabel>
                                        </Col>
                                        <Col md={12}>
                                            <FloatingLabel controlId="status" label="Status">
                                                <Form.Select
                                                    value={formulario.status}
                                                    onChange={e => setFormulario({ ...formulario, status: e.target.value })}
                                                >
                                                    <option value="disponivel">Disponível</option>
                                                    <option value="reservado">Reservado</option>
                                                </Form.Select>
                                            </FloatingLabel>
                                        </Col>
                                        <Col md={6}>
                                            <FloatingLabel controlId="valorizacao" label="Valorização até entrega">
                                                <Form.Control
                                                    value={formulario.valorizacao}
                                                    onChange={e => setFormulario({ ...formulario, valorizacao: e.target.value })}
                                                />
                                            </FloatingLabel>
                                        </Col>
                                        <Col md={6}>
                                            <FloatingLabel controlId="lucro" label="Lucro estimado">
                                                <Form.Control
                                                    value={formulario.lucro}
                                                    onChange={e => setFormulario({ ...formulario, lucro: e.target.value })}
                                                />
                                            </FloatingLabel>
                                        </Col>
                                        <Col md={4}>
                                            <FloatingLabel controlId="aluguel" label="Valor Aluguel">
                                                <Form.Control
                                                    value={formulario.aluguel}
                                                    onChange={e => setFormulario({ ...formulario, aluguel: e.target.value })}
                                                />
                                            </FloatingLabel>
                                        </Col>
                                        <Col md={4}>
                                            <FloatingLabel controlId="condominio" label="Valor Condomínio">
                                                <Form.Control
                                                    value={formulario.condominio}
                                                    onChange={e => setFormulario({ ...formulario, condominio: e.target.value })}
                                                />
                                            </FloatingLabel>
                                        </Col>
                                        <Col md={4}>
                                            <FloatingLabel controlId="iptu" label="Valor IPTU">
                                                <Form.Control
                                                    value={formulario.iptu}
                                                    onChange={e => setFormulario({ ...formulario, iptu: e.target.value })}
                                                />
                                            </FloatingLabel>
                                        </Col>
                                        <Col md={12}>
                                            <Form.Group controlId="formImagem">
                                                <Form.Label>Imagem da sala</Form.Label>
                                                <Form.Control type="file" onChange={e => setFormulario({ ...formulario, imagem: e.target.files[0] })} />
                                            </Form.Group>
                                        </Col>
                                        <Col md={12}>
                                            <Form.Group controlId="formImagemPlanta">
                                                <Form.Label>Imagem da planta</Form.Label>
                                                <Form.Control type="file" onChange={e => setFormulario({ ...formulario, imagemPlanta: e.target.files[0] })} />
                                            </Form.Group>
                                        </Col>
                                        <Col md={12}>
                                            <Form.Group controlId="formImagemProposta">
                                                <Form.Label>Imagem da proposta</Form.Label>
                                                <Form.Control type="file" onChange={e => setFormulario({ ...formulario, imagemProposta: e.target.files[0] })} />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <div className="d-grid mt-4">
                                        <Button type="submit" variant="warning" size="lg" className="fw-bold text-dark">
                                            <i className="bi bi-check-circle me-2"></i>
                                            Confirmar cadastro de sala neste andar
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            <footer className="text-center py-4 mt-5 border-top" style={{ backgroundColor: '#000000' }}>
                <small className="text-white">Wall Street Corporate © {new Date().getFullYear()}</small>
            </footer>

        </Container>
    );
};

export default Painel;
