import Config from '../Config'
import { Button } from 'react-bootstrap'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ApiData({ codigo = '' }) {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [mostrarModal, setMostrarModal] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${Config.api_url}/api/formularios/${codigo}`)
                if (!response.ok) {
                    throw new Error('Erro ao buscar dados')
                }
                const json = await response.json()
                setData(json)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) return <div>Carregando...</div>
    if (error) return <div>Erro: {error}</div>

    const handleSubmit = async event => {
        event.preventDefault()
        const response = await fetch(event.target.action, {
            credentials: 'include',
            method: event.target.method,
            headers: {
                'X-CSRFToken': Config.csrf_Token,
                'Content-Type': 'x-www-form-urlencoded',
            },
            body: new URLSearchParams(new FormData(event.target)),
        })
        if (response.ok) {
            setMostrarModal(false)
            alert('Formulário enviado com sucesso!')
        } else {
            setMostrarModal(false)
            alert('Erro ao enviar formulário.')
        }
    }

    return data.formularios.map(formulario => (
        <div className="d-flex flex-column gap-2 w-100">
            <Button variant="warning" className="fw-bold text-dark" onClick={() => setMostrarModal(true)}>
                {formulario.titulo.toUpperCase()}
            </Button>
            <AnimatePresence>
                {mostrarModal && (
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
                                background: 'rgba(0, 69, 138, 0.9)',
                                borderRadius: '20px',
                                width: '90%',
                                maxWidth: '400px',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
                            }}
                        >
                            <h5 className="text-white text-center fw-bold mb-4">
                                {formulario.descricao}
                            </h5>

                            <form
                                onSubmit={handleSubmit}
                                method={formulario.metodo}
                                className="d-flex flex-column gap-3"
                                action={`${Config.api_url}${formulario.acao_url}`}
                            >
                                {formulario.entradas.map(entrada => {
                                    return entrada.tipo === 'submit' ? (
                                        <button
                                            type="{entrada.tipo}"
                                            className="btn fw-bold text-dark rounded-pill py-3"
                                            style={{ backgroundColor: '#FFAB52' }}
                                        >
                                            {entrada.titulo.toUpperCase()}
                                        </button>
                                    ) : (
                                        <input
                                            name={entrada.nome}
                                            type={entrada.tipo}
                                            required={entrada.requerido}
                                            placeholder={entrada.titulo.toUpperCase()}
                                            className="form-control rounded-4 px-3 py-3 mb-3"
                                        />
                                    )
                                })}
                            </form>
                            <button onClick={() => setMostrarModal(false)} className="btn-close position-absolute top-0 end-0 m-3"></button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    ))
}