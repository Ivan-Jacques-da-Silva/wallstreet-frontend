
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Navbar, Nav, FloatingLabel, Table, Badge, Modal, Tab, Tabs } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Config from '../Config';

const Painel = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('formularios');
    const [preReservas, setPreReservas] = useState([]);
    const [contrapropostas, setContrapropostas] = useState([]);
    const [agendamentos, setAgendamentos] = useState([]);
    const [salas, setSalas] = useState([]);
    const [showSalaModal, setShowSalaModal] = useState(false);
    const [salaEdicao, setSalaEdicao] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('admin-token');
        if (!token) {
            navigate('/login');
            return;
        }
        carregarDados();
    }, [navigate]);

    // Renderizar loading enquanto verifica autenticação
    const token = localStorage.getItem('admin-token');
    if (!token) {
        return (
            <Container className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status"></div>
                    <h5>Verificando acesso...</h5>
                </div>
            </Container>
        );
    }

    const carregarDados = async () => {
        try {
            const token = localStorage.getItem('admin-token');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            const [preRes, contraRes, agendRes, salasRes] = await Promise.all([
                fetch(`${Config.api_url}/api/admin/pre-reservas`, { headers }),
                fetch(`${Config.api_url}/api/admin/contrapropostas`, { headers }),
                fetch(`${Config.api_url}/api/admin/agendamentos`, { headers }),
                fetch(`${Config.api_url}/api/salas`)
            ]);

            const preData = await preRes.json();
            const contraData = await contraRes.json();
            const agendData = await agendRes.json();
            const salasData = await salasRes.json();

            // Verificar se alguma resposta retornou erro de autenticação
            if (preRes.status === 401 || contraRes.status === 401 || agendRes.status === 401) {
                localStorage.removeItem('admin-token');
                navigate('/login');
                return;
            }

            if (preData.sucesso) setPreReservas(preData.data);
            if (contraData.sucesso) setContrapropostas(contraData.data);
            if (agendData.sucesso) setAgendamentos(agendData.data);
            
            // Processar dados das salas
            if (salasData.produtos && salasData.produtos[0]?.variacoes) {
                const todasSalas = [];
                salasData.produtos[0].variacoes.forEach(andar => {
                    andar.variacoes.forEach((sala, index) => {
                        todasSalas.push({
                            id: `${andar.atributos.andar[0].valor}-${index + 1}`,
                            andar: andar.atributos.andar[0].valor,
                            numero: index + 1,
                            nome: sala.atributos.nome[0].valor,
                            area: sala.atributos.area[0].valor,
                            posicao: sala.atributos.posicao[0].valor,
                            preco: sala.precos.de[0].valor,
                            disponivel: sala.atributos.disponibilidade[0].valor,
                            imagem: sala.arquivos.imagens[0]?.baixar,
                            planta: sala.arquivos.plantas[0]?.baixar
                        });
                    });
                });
                setSalas(todasSalas);
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                localStorage.removeItem('admin-token');
                navigate('/acesso-negado');
            }
        }
    };

    const marcarComoVisualizado = async (tipo, id) => {
        try {
            const token = localStorage.getItem('admin-token');
            const response = await fetch(`${Config.api_url}/api/admin/${tipo}/${id}/visualizar`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                carregarDados();
            }
        } catch (error) {
            console.error('Erro ao marcar como visualizado:', error);
        }
    };

    const abrirEdicaoSala = (sala) => {
        setSalaEdicao(sala || {
            id: '',
            andar: 15,
            numero: '',
            nome: '',
            area: '',
            posicao: '',
            preco: '',
            disponivel: true,
            imagem: null,
            planta: null
        });
        setShowSalaModal(true);
    };

    const salvarSala = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('numero', salaEdicao.numero);
            formData.append('andar', salaEdicao.andar);
            formData.append('nome', salaEdicao.nome);
            formData.append('area', salaEdicao.area);
            formData.append('posicao', salaEdicao.posicao);
            formData.append('orientacao', salaEdicao.posicao);
            formData.append('preco', salaEdicao.preco);
            formData.append('disponivel', salaEdicao.disponivel);

            if (salaEdicao.imagemFile) {
                formData.append('imagem', salaEdicao.imagemFile);
            }
            if (salaEdicao.plantaFile) {
                formData.append('planta', salaEdicao.plantaFile);
            }

            const url = salaEdicao.id ? 
                `${Config.api_url}/api/salas/${salaEdicao.id}` : 
                `${Config.api_url}/api/salas`;
            
            const method = salaEdicao.id ? 'PUT' : 'POST';

            const token = localStorage.getItem('admin-token');
            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                setShowSalaModal(false);
                carregarDados();
                alert('Sala salva com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao salvar sala:', error);
            alert('Erro ao salvar sala');
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('admin-token');
        navigate('/login');
    };

    const formatarData = (dataString) => {
        return new Date(dataString).toLocaleString('pt-BR');
    };

    return (
        <Container fluid className="p-0" style={{ backgroundColor: '#ffffff', minHeight: '100vh', color: '#001A47' }}>
            <Navbar expand="lg" className="shadow-sm px-4 py-3 mb-4" style={{ backgroundColor: '#001A47' }}>
                <Navbar.Brand className="fw-bold text-uppercase text-white">
                    Painel Administrativo - Wall Street
                </Navbar.Brand>
                <Nav className="ms-auto">
                    <Button variant="outline-light" onClick={logout}>
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Sair
                    </Button>
                </Nav>
            </Navbar>

            <Container className="pb-5">
                <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    className="mb-4"
                >
                    <Tab eventKey="formularios" title="Formulários">
                        <Row>
                            <Col md={4}>
                                <Card className="mb-4">
                                    <Card.Header>
                                        <h5 className="mb-0">Pré-Reservas</h5>
                                    </Card.Header>
                                    <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {preReservas.map((item) => (
                                            <div key={item.id} className={`p-2 mb-2 rounded ${!item.visualizado ? 'bg-warning bg-opacity-25' : 'bg-light'}`}>
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <strong>{item.nome}</strong><br />
                                                        <small>{item.email}</small><br />
                                                        <small>{item.contato}</small><br />
                                                        <small>{formatarData(item.createdAt)}</small>
                                                    </div>
                                                    <div>
                                                        {!item.visualizado && (
                                                            <Badge bg="warning">Novo</Badge>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="outline-primary"
                                                            className="ms-2"
                                                            onClick={() => marcarComoVisualizado('pre-reservas', item.id)}
                                                        >
                                                            <i className="bi bi-check"></i>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={4}>
                                <Card className="mb-4">
                                    <Card.Header>
                                        <h5 className="mb-0">Contrapropostas</h5>
                                    </Card.Header>
                                    <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {contrapropostas.map((item) => (
                                            <div key={item.id} className={`p-2 mb-2 rounded ${!item.visualizado ? 'bg-warning bg-opacity-25' : 'bg-light'}`}>
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <strong>{item.nome}</strong><br />
                                                        <small>{item.email}</small><br />
                                                        <small>{item.contato}</small><br />
                                                        <small><strong>Proposta:</strong> {item.proposta}</small><br />
                                                        <small>{formatarData(item.createdAt)}</small>
                                                    </div>
                                                    <div>
                                                        {!item.visualizado && (
                                                            <Badge bg="warning">Novo</Badge>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="outline-primary"
                                                            className="ms-2"
                                                            onClick={() => marcarComoVisualizado('contrapropostas', item.id)}
                                                        >
                                                            <i className="bi bi-check"></i>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={4}>
                                <Card className="mb-4">
                                    <Card.Header>
                                        <h5 className="mb-0">Agendamentos</h5>
                                    </Card.Header>
                                    <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {agendamentos.map((item) => (
                                            <div key={item.id} className={`p-2 mb-2 rounded ${!item.visualizado ? 'bg-warning bg-opacity-25' : 'bg-light'}`}>
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <strong>{item.nome}</strong><br />
                                                        <small>{item.email}</small><br />
                                                        <small>{item.contato}</small><br />
                                                        <small><strong>Data:</strong> {item.data} às {item.hora}</small><br />
                                                        <small>{formatarData(item.createdAt)}</small>
                                                    </div>
                                                    <div>
                                                        {!item.visualizado && (
                                                            <Badge bg="warning">Novo</Badge>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="outline-primary"
                                                            className="ms-2"
                                                            onClick={() => marcarComoVisualizado('agendamentos', item.id)}
                                                        >
                                                            <i className="bi bi-check"></i>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Tab>

                    <Tab eventKey="salas" title="Gerenciar Salas">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4>Salas Cadastradas</h4>
                            <Button variant="primary" onClick={() => abrirEdicaoSala()}>
                                <i className="bi bi-plus-circle me-2"></i>
                                Nova Sala
                            </Button>
                        </div>

                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Andar</th>
                                    <th>Número</th>
                                    <th>Nome</th>
                                    <th>Área</th>
                                    <th>Posição</th>
                                    <th>Preço</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salas.map((sala) => (
                                    <tr key={sala.id}>
                                        <td>{sala.andar}°</td>
                                        <td>{sala.numero}</td>
                                        <td>{sala.nome}</td>
                                        <td>{sala.area} m²</td>
                                        <td>{sala.posicao}</td>
                                        <td>R$ {parseFloat(sala.preco).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                                        <td>
                                            <Badge bg={sala.disponivel ? 'success' : 'danger'}>
                                                {sala.disponivel ? 'Disponível' : 'Reservado'}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Button
                                                size="sm"
                                                variant="outline-primary"
                                                onClick={() => abrirEdicaoSala(sala)}
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Tab>
                </Tabs>
            </Container>

            {/* Modal de Edição de Sala */}
            <Modal show={showSalaModal} onHide={() => setShowSalaModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {salaEdicao?.id ? 'Editar Sala' : 'Nova Sala'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={salvarSala}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <FloatingLabel controlId="andar" label="Andar" className="mb-3">
                                    <Form.Select
                                        value={salaEdicao?.andar || ''}
                                        onChange={(e) => setSalaEdicao({...salaEdicao, andar: parseInt(e.target.value)})}
                                        required
                                    >
                                        {Array.from({length: 15}, (_, i) => 19 - i).map(andar => (
                                            <option key={andar} value={andar}>{andar}° andar</option>
                                        ))}
                                    </Form.Select>
                                </FloatingLabel>
                            </Col>
                            <Col md={6}>
                                <FloatingLabel controlId="numero" label="Número" className="mb-3">
                                    <Form.Control
                                        type="text"
                                        value={salaEdicao?.numero || ''}
                                        onChange={(e) => setSalaEdicao({...salaEdicao, numero: e.target.value})}
                                        required
                                    />
                                </FloatingLabel>
                            </Col>
                            <Col md={12}>
                                <FloatingLabel controlId="nome" label="Nome da Sala" className="mb-3">
                                    <Form.Control
                                        type="text"
                                        value={salaEdicao?.nome || ''}
                                        onChange={(e) => setSalaEdicao({...salaEdicao, nome: e.target.value})}
                                        required
                                    />
                                </FloatingLabel>
                            </Col>
                            <Col md={6}>
                                <FloatingLabel controlId="area" label="Área (m²)" className="mb-3">
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        value={salaEdicao?.area || ''}
                                        onChange={(e) => setSalaEdicao({...salaEdicao, area: e.target.value})}
                                        required
                                    />
                                </FloatingLabel>
                            </Col>
                            <Col md={6}>
                                <FloatingLabel controlId="preco" label="Preço" className="mb-3">
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        value={salaEdicao?.preco || ''}
                                        onChange={(e) => setSalaEdicao({...salaEdicao, preco: e.target.value})}
                                        required
                                    />
                                </FloatingLabel>
                            </Col>
                            <Col md={12}>
                                <FloatingLabel controlId="posicao" label="Posição/Orientação" className="mb-3">
                                    <Form.Control
                                        type="text"
                                        value={salaEdicao?.posicao || ''}
                                        onChange={(e) => setSalaEdicao({...salaEdicao, posicao: e.target.value})}
                                        required
                                    />
                                </FloatingLabel>
                            </Col>
                            <Col md={12}>
                                <Form.Check
                                    type="checkbox"
                                    label="Sala disponível"
                                    checked={salaEdicao?.disponivel || false}
                                    onChange={(e) => setSalaEdicao({...salaEdicao, disponivel: e.target.checked})}
                                    className="mb-3"
                                />
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Imagem da Sala</Form.Label>
                                    <Form.Control
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setSalaEdicao({...salaEdicao, imagemFile: e.target.files[0]})}
                                    />
                                    {salaEdicao?.imagem && (
                                        <small className="text-muted">Imagem atual: {salaEdicao.imagem}</small>
                                    )}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Planta da Sala</Form.Label>
                                    <Form.Control
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setSalaEdicao({...salaEdicao, plantaFile: e.target.files[0]})}
                                    />
                                    {salaEdicao?.planta && (
                                        <small className="text-muted">Planta atual: {salaEdicao.planta}</small>
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowSalaModal(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <footer className="text-center py-4 mt-5 border-top" style={{ backgroundColor: '#000000' }}>
                <small className="text-white">Wall Street Corporate © {new Date().getFullYear()}</small>
            </footer>
        </Container>
    );
};

export default Painel;
