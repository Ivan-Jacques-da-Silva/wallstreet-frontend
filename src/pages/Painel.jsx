
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Navbar, Nav, FloatingLabel, Table, Badge, Modal, Tab, Tabs, Pagination, InputGroup } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import toast, { Toaster } from 'react-hot-toast';
import { Upload, Image, FileText, Eye, Check, Plus, Edit3, Building, Search, Filter } from 'lucide-react';
import Config from '../Config';

const Painel = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('salas');
    const [preReservas, setPreReservas] = useState([]);
    const [contrapropostas, setContrapropostas] = useState([]);
    const [agendamentos, setAgendamentos] = useState([]);
    const [salas, setSalas] = useState([]);
    const [showSalaModal, setShowSalaModal] = useState(false);
    const [salaEdicao, setSalaEdicao] = useState(null);
    const [loading, setLoading] = useState(false);
    const [imagemPreview, setImagemPreview] = useState(null);
    const [plantaPreview, setPlantaPreview] = useState(null);
    
    // Estados para paginação e filtros
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [filtroDisponibilidade, setFiltroDisponibilidade] = useState('todos');
    const itensPorPagina = 10;

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

    // Função para filtrar salas
    const salasFiltradas = salas.filter(sala => {
        const matchPesquisa = sala.nome.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
                             sala.andar.toString().includes(termoPesquisa) ||
                             sala.numero.toString().includes(termoPesquisa);
        
        const matchDisponibilidade = filtroDisponibilidade === 'todos' ||
                                   (filtroDisponibilidade === 'disponivel' && sala.disponivel) ||
                                   (filtroDisponibilidade === 'indisponivel' && !sala.disponivel);
        
        return matchPesquisa && matchDisponibilidade;
    });

    // Calcular paginação
    const totalPaginas = Math.ceil(salasFiltradas.length / itensPorPagina);
    const indiceInicio = (paginaAtual - 1) * itensPorPagina;
    const indiceFim = indiceInicio + itensPorPagina;
    const salasExibidas = salasFiltradas.slice(indiceInicio, indiceFim);

    // Reset da página quando filtros mudam
    useEffect(() => {
        setPaginaAtual(1);
    }, [termoPesquisa, filtroDisponibilidade]);

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
                toast.success('Marcado como visualizado!');
                carregarDados();
            }
        } catch (error) {
            console.error('Erro ao marcar como visualizado:', error);
            toast.error('Erro ao marcar como visualizado');
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
        setImagemPreview(sala?.imagem ? `${Config.api_url}${sala.imagem}` : null);
        setPlantaPreview(sala?.planta ? `${Config.api_url}${sala.planta}` : null);
        setShowSalaModal(true);
    };

    // Dropzone para imagem
    const onDropImagem = useCallback((acceptedFiles, rejectedFiles) => {
        if (rejectedFiles.length > 0) {
            const error = rejectedFiles[0].errors[0];
            if (error.code === 'file-too-large') {
                toast.error('Arquivo muito grande! Máximo 10MB.');
            } else if (error.code === 'file-invalid-type') {
                toast.error('Tipo de arquivo inválido! Use PNG, JPG ou WEBP.');
            } else {
                toast.error('Erro ao selecionar arquivo.');
            }
            return;
        }

        const file = acceptedFiles[0];
        if (file) {
            setSalaEdicao(prev => ({ ...prev, imagemFile: file }));
            const previewUrl = URL.createObjectURL(file);
            setImagemPreview(previewUrl);
            toast.success('Imagem selecionada com sucesso!');
        }
    }, []);

    // Dropzone para planta
    const onDropPlanta = useCallback((acceptedFiles, rejectedFiles) => {
        if (rejectedFiles.length > 0) {
            const error = rejectedFiles[0].errors[0];
            if (error.code === 'file-too-large') {
                toast.error('Arquivo muito grande! Máximo 10MB.');
            } else if (error.code === 'file-invalid-type') {
                toast.error('Tipo de arquivo inválido! Use PNG, JPG ou WEBP.');
            } else {
                toast.error('Erro ao selecionar arquivo.');
            }
            return;
        }

        const file = acceptedFiles[0];
        if (file) {
            setSalaEdicao(prev => ({ ...prev, plantaFile: file }));
            const previewUrl = URL.createObjectURL(file);
            setPlantaPreview(previewUrl);
            toast.success('Planta selecionada com sucesso!');
        }
    }, []);

    const { getRootProps: getImagemRootProps, getInputProps: getImagemInputProps, isDragActive: isImagemDragActive, open: openImagemDialog } = useDropzone({
        onDrop: onDropImagem,
        accept: { 
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/webp': ['.webp']
        },
        multiple: false,
        maxSize: 10485760, // 10MB
        noClick: true,  // Desabilitar clique automático
        noKeyboard: false
    });

    const { getRootProps: getPlantaRootProps, getInputProps: getPlantaInputProps, isDragActive: isPlantaDragActive, open: openPlantaDialog } = useDropzone({
        onDrop: onDropPlanta,
        accept: { 
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/webp': ['.webp']
        },
        multiple: false,
        maxSize: 10485760, // 10MB
        noClick: true,  // Desabilitar clique automático
        noKeyboard: false
    });

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
                toast.success('Sala salva com sucesso!');
                setImagemPreview(null);
                setPlantaPreview(null);
            }
        } catch (error) {
            console.error('Erro ao salvar sala:', error);
            toast.error('Erro ao salvar sala');
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

    const DropzoneArea = ({ getRootProps, getInputProps, isDragActive, preview, type, icon: Icon, openDialog }) => (
        <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-4 p-3 text-center position-relative ${
                isDragActive 
                    ? 'border-primary bg-primary bg-opacity-10' 
                    : 'border-secondary'
            }`}
            style={{ 
                minHeight: '180px', 
                transition: 'all 0.3s ease',
                backgroundColor: isDragActive ? '#f8f9fa' : '#fff'
            }}
        >
            <input {...getInputProps()} style={{ display: 'none' }} />
            {preview ? (
                <div 
                    className="position-relative h-100 d-flex flex-column align-items-center justify-content-center"
                    onClick={(e) => {
                        e.stopPropagation();
                        openDialog();
                    }}
                    style={{ cursor: 'pointer' }}
                >
                    <img 
                        src={preview} 
                        alt={`Preview ${type}`}
                        className="img-fluid rounded mb-2"
                        style={{ 
                            maxHeight: '120px', 
                            maxWidth: '100%', 
                            objectFit: 'cover',
                            border: '1px solid #dee2e6'
                        }}
                    />
                    <div className="small text-muted fw-semibold mb-1">
                        <Icon size={16} className="me-1" />
                        {type} selecionada
                    </div>
                    <div className="small text-primary">
                        <i className="bi bi-pencil-square me-1"></i>
                        Clique para alterar
                    </div>
                </div>
            ) : (
                <div 
                    className="d-flex flex-column align-items-center justify-content-center h-100"
                    onClick={(e) => {
                        e.stopPropagation();
                        openDialog();
                    }}
                    style={{ cursor: 'pointer' }}
                >
                    <Icon size={40} className={`mb-3 ${isDragActive ? 'text-primary' : 'text-muted'}`} />
                    <p className="mb-2 fw-semibold" style={{ color: isDragActive ? '#0d6efd' : '#6c757d' }}>
                        {isDragActive ? 
                            `Solte a ${type.toLowerCase()} aqui` : 
                            `Selecionar ${type.toLowerCase()}`
                        }
                    </p>
                    <small className="text-muted">
                        Clique ou arraste arquivos aqui
                    </small>
                    <small className="text-muted">
                        PNG, JPG até 10MB
                    </small>
                </div>
            )}
        </div>
    );

    const FormularioCard = ({ title, items, tipo, icon }) => (
        <Card className="h-100 shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
            <Card.Header className="bg-white border-0 pb-0">
                <div className="d-flex align-items-center">
                    {icon}
                    <h5 className="mb-0 ms-2">{title}</h5>
                    <Badge bg="primary" className="ms-auto">{items.length}</Badge>
                </div>
            </Card.Header>
            <Card.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {items.length === 0 ? (
                    <div className="text-center text-muted py-4">
                        <p>Nenhum item encontrado</p>
                    </div>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className={`p-3 mb-3 rounded-3 ${!item.visualizado ? 'border border-warning bg-warning bg-opacity-10' : 'bg-white'}`}>
                            <div className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                    <div className="fw-bold text-dark mb-1">{item.nome}</div>
                                    <div className="small text-muted mb-1">
                                        <i className="bi bi-envelope me-1"></i>
                                        {item.email}
                                    </div>
                                    <div className="small text-muted mb-1">
                                        <i className="bi bi-phone me-1"></i>
                                        {item.contato}
                                    </div>
                                    {item.proposta && (
                                        <div className="small text-muted mb-1">
                                            <i className="bi bi-chat-text me-1"></i>
                                            <strong>Proposta:</strong> {item.proposta}
                                        </div>
                                    )}
                                    {item.data && item.hora && (
                                        <div className="small text-muted mb-1">
                                            <i className="bi bi-calendar me-1"></i>
                                            <strong>Agendado:</strong> {item.data} às {item.hora}
                                        </div>
                                    )}
                                    <div className="small text-muted">
                                        <i className="bi bi-clock me-1"></i>
                                        {formatarData(item.createdAt)}
                                    </div>
                                </div>
                                <div className="d-flex flex-column align-items-end">
                                    {!item.visualizado && (
                                        <Badge bg="warning" className="mb-2">Novo</Badge>
                                    )}
                                    <Button
                                        size="sm"
                                        variant={!item.visualizado ? "success" : "outline-secondary"}
                                        onClick={() => marcarComoVisualizado(tipo, item.id)}
                                        className="d-flex align-items-center"
                                    >
                                        <Check size={16} className="me-1" />
                                        {!item.visualizado ? 'Marcar' : 'Visto'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </Card.Body>
        </Card>
    );

    return (
        <Container fluid className="p-0" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Toaster position="top-right" />
            
            <Navbar expand="lg" className="shadow-sm px-4 py-3 mb-4" style={{ background: 'linear-gradient(135deg, #001A47 0%, #003875 100%)' }}>
                <Navbar.Brand className="fw-bold text-uppercase text-white d-flex align-items-center">
                    <Building className="me-2" />
                    Painel Administrativo - Wall Street
                </Navbar.Brand>
                <Nav className="ms-auto">
                    <Link to="/andares" className="btn btn-outline-light me-3">
                        <Building size={16} className="me-2" />
                        Ver Andares
                    </Link>
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
                    className="mb-4 nav-pills"
                >
                    <Tab eventKey="formularios" title={
                        <span className="d-flex align-items-center">
                            <Eye className="me-2" size={16} />
                            Formulários
                        </span>
                    }>
                        <Row className="g-4">
                            <Col lg={4}>
                                <FormularioCard 
                                    title="Pré-Reservas" 
                                    items={preReservas} 
                                    tipo="pre-reservas"
                                    icon={<i className="bi bi-bookmark-check text-primary"></i>}
                                />
                            </Col>
                            <Col lg={4}>
                                <FormularioCard 
                                    title="Contrapropostas" 
                                    items={contrapropostas} 
                                    tipo="contrapropostas"
                                    icon={<i className="bi bi-chat-square-text text-warning"></i>}
                                />
                            </Col>
                            <Col lg={4}>
                                <FormularioCard 
                                    title="Agendamentos" 
                                    items={agendamentos} 
                                    tipo="agendamentos"
                                    icon={<i className="bi bi-calendar-check text-success"></i>}
                                />
                            </Col>
                        </Row>
                    </Tab>

                    <Tab eventKey="salas" title={
                        <span className="d-flex align-items-center">
                            <Building className="me-2" size={16} />
                            Gerenciar Salas
                        </span>
                    }>
                        <Card className="shadow-sm border-0 mb-4">
                            <Card.Header className="bg-white border-0">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h4 className="mb-0 d-flex align-items-center">
                                        <Building className="me-2" />
                                        Salas Cadastradas
                                        <Badge bg="secondary" className="ms-2">{salasFiltradas.length} salas</Badge>
                                    </h4>
                                    <Button 
                                        variant="primary" 
                                        onClick={() => abrirEdicaoSala()}
                                        className="d-flex align-items-center"
                                        style={{ background: 'linear-gradient(135deg, #001A47 0%, #003875 100%)', border: 'none' }}
                                    >
                                        <Plus size={16} className="me-2" />
                                        Nova Sala
                                    </Button>
                                </div>
                                
                                {/* Filtros e Pesquisa */}
                                <Row className="g-3">
                                    <Col md={6}>
                                        <InputGroup>
                                            <InputGroup.Text className="bg-light border-end-0">
                                                <Search size={16} />
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                placeholder="Pesquisar por nome, andar ou número..."
                                                value={termoPesquisa}
                                                onChange={(e) => setTermoPesquisa(e.target.value)}
                                                className="border-start-0"
                                            />
                                        </InputGroup>
                                    </Col>
                                    <Col md={4}>
                                        <InputGroup>
                                            <InputGroup.Text className="bg-light border-end-0">
                                                <Filter size={16} />
                                            </InputGroup.Text>
                                            <Form.Select
                                                value={filtroDisponibilidade}
                                                onChange={(e) => setFiltroDisponibilidade(e.target.value)}
                                                className="border-start-0"
                                            >
                                                <option value="todos">Todas as salas</option>
                                                <option value="disponivel">Apenas disponíveis</option>
                                                <option value="indisponivel">Apenas reservadas</option>
                                            </Form.Select>
                                        </InputGroup>
                                    </Col>
                                    <Col md={2}>
                                        <div className="text-muted small">
                                            Página {paginaAtual} de {totalPaginas}
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <Table striped hover responsive className="mb-0">
                                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                                        <tr>
                                            <th className="border-0">Andar</th>
                                            <th className="border-0">Número</th>
                                            <th className="border-0">Nome</th>
                                            <th className="border-0">Área</th>
                                            <th className="border-0">Posição</th>
                                            <th className="border-0">Preço</th>
                                            <th className="border-0">Status</th>
                                            <th className="border-0">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {salasExibidas.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="text-center py-4 text-muted">
                                                    <Building size={32} className="mb-2 opacity-50" />
                                                    <div>Nenhuma sala encontrada com os filtros aplicados</div>
                                                </td>
                                            </tr>
                                        ) : (
                                            salasExibidas.map((sala) => (
                                                <tr key={sala.id} className="align-middle">
                                                    <td className="fw-semibold">{sala.andar}°</td>
                                                    <td>{sala.numero}</td>
                                                    <td>{sala.nome}</td>
                                                    <td>{sala.area} m²</td>
                                                    <td>
                                                        <span className="badge bg-light text-dark border">{sala.posicao}</span>
                                                    </td>
                                                    <td className="fw-semibold">R$ {parseFloat(sala.preco).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                                                    <td>
                                                        <Badge bg={sala.disponivel ? 'success' : 'danger'} className="px-3 py-2">
                                                            {sala.disponivel ? 'Disponível' : 'Reservado'}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <Button
                                                            size="sm"
                                                            variant="outline-primary"
                                                            onClick={() => abrirEdicaoSala(sala)}
                                                            className="d-flex align-items-center"
                                                        >
                                                            <Edit3 size={14} className="me-1" />
                                                            Editar
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                                
                                {/* Paginação */}
                                {totalPaginas > 1 && (
                                    <div className="d-flex justify-content-center p-3 border-top">
                                        <Pagination className="mb-0">
                                            <Pagination.First 
                                                onClick={() => setPaginaAtual(1)}
                                                disabled={paginaAtual === 1}
                                            />
                                            <Pagination.Prev 
                                                onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
                                                disabled={paginaAtual === 1}
                                            />
                                            
                                            {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                                                let pageNum;
                                                if (totalPaginas <= 5) {
                                                    pageNum = i + 1;
                                                } else if (paginaAtual <= 3) {
                                                    pageNum = i + 1;
                                                } else if (paginaAtual >= totalPaginas - 2) {
                                                    pageNum = totalPaginas - 4 + i;
                                                } else {
                                                    pageNum = paginaAtual - 2 + i;
                                                }
                                                
                                                return (
                                                    <Pagination.Item
                                                        key={pageNum}
                                                        active={pageNum === paginaAtual}
                                                        onClick={() => setPaginaAtual(pageNum)}
                                                    >
                                                        {pageNum}
                                                    </Pagination.Item>
                                                );
                                            })}
                                            
                                            <Pagination.Next 
                                                onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
                                                disabled={paginaAtual === totalPaginas}
                                            />
                                            <Pagination.Last 
                                                onClick={() => setPaginaAtual(totalPaginas)}
                                                disabled={paginaAtual === totalPaginas}
                                            />
                                        </Pagination>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Tab>
                </Tabs>
            </Container>

            {/* Modal de Edição de Sala - Modernizado */}
            <Modal show={showSalaModal} onHide={() => setShowSalaModal(false)} size="xl" centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="d-flex align-items-center">
                        {salaEdicao?.id ? <Edit3 className="me-2" /> : <Plus className="me-2" />}
                        {salaEdicao?.id ? 'Editar Sala' : 'Nova Sala'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={salvarSala}>
                    <Modal.Body className="px-4">
                        <Row className="g-4">
                            {/* Informações Básicas */}
                            <Col md={6}>
                                <Card className="h-100 border-0" style={{ backgroundColor: '#f8f9fa' }}>
                                    <Card.Header className="bg-transparent border-0 pb-2">
                                        <h6 className="mb-0 text-muted">INFORMAÇÕES BÁSICAS</h6>
                                    </Card.Header>
                                    <Card.Body>
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
                                            <Col md={4}>
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
                                            <Col md={8}>
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
                                                <div className="form-check form-switch">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id="disponibilidade"
                                                        checked={salaEdicao?.disponivel || false}
                                                        onChange={(e) => setSalaEdicao({...salaEdicao, disponivel: e.target.checked})}
                                                    />
                                                    <label className="form-check-label fw-semibold" htmlFor="disponibilidade">
                                                        Sala disponível para venda
                                                    </label>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* Upload de Arquivos */}
                            <Col md={6}>
                                <Card className="h-100 border-0" style={{ backgroundColor: '#f8f9fa' }}>
                                    <Card.Header className="bg-transparent border-0 pb-2">
                                        <h6 className="mb-0 text-muted fw-bold">
                                            <Upload size={16} className="me-2" />
                                            ARQUIVOS DA SALA
                                        </h6>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md={12} className="mb-4">
                                                <label className="form-label fw-semibold mb-3 d-flex align-items-center">
                                                    <Image size={18} className="me-2 text-primary" />
                                                    Imagem da Sala
                                                </label>
                                                <DropzoneArea 
                                                    getRootProps={getImagemRootProps}
                                                    getInputProps={getImagemInputProps}
                                                    isDragActive={isImagemDragActive}
                                                    preview={imagemPreview}
                                                    type="Imagem"
                                                    icon={Image}
                                                    openDialog={openImagemDialog}
                                                />
                                            </Col>
                                            <Col md={12}>
                                                <label className="form-label fw-semibold mb-3 d-flex align-items-center">
                                                    <FileText size={18} className="me-2 text-primary" />
                                                    Planta da Sala
                                                </label>
                                                <DropzoneArea 
                                                    getRootProps={getPlantaRootProps}
                                                    getInputProps={getPlantaInputProps}
                                                    isDragActive={isPlantaDragActive}
                                                    preview={plantaPreview}
                                                    type="Planta"
                                                    icon={FileText}
                                                    openDialog={openPlantaDialog}
                                                />
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer className="border-0 pt-0">
                        <Button variant="outline-secondary" onClick={() => setShowSalaModal(false)}>
                            Cancelar
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading}
                            style={{ background: 'linear-gradient(135deg, #001A47 0%, #003875 100%)', border: 'none' }}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Check size={16} className="me-2" />
                                    Salvar Sala
                                </>
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <footer className="text-center py-4 mt-5" style={{ backgroundColor: '#001A47' }}>
                <small className="text-white">Wall Street Corporate © {new Date().getFullYear()}</small>
            </footer>
        </Container>
    );
};

export default Painel;
