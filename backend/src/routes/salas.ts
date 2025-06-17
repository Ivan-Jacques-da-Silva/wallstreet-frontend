import { Router, Request, Response } from "express";
import { prisma, upload } from "../../server";
import { authenticateAdmin } from "../middleware/auth";

const router = Router();

const router = Router();

// Buscar todas as salas
router.get("/salas", async (req: Request, res: Response) => {
  try {
    const { andar } = req.query;

    const where = andar ? { andar: parseInt(andar as string) } : {};

    const salas = await prisma.sala.findMany({
      where,
      orderBy: [{ andar: "asc" }, { numero: "asc" }],
    });

    // Se não há salas, retornar estrutura vazia mas consistente
    if (salas.length === 0) {
      return res.json({
        produtos: [
          {
            variacoes: [],
          },
        ],
      });
    }

    res.json({
      produtos: [
        {
          variacoes: salas.reduce((acc: any[], sala) => {
            let andarExistente = acc.find(
              (a) => a.atributos?.andar?.[0]?.valor === sala.andar,
            );

            if (!andarExistente) {
              andarExistente = {
                atributos: {
                  andar: [{ valor: sala.andar }],
                },
                variacoes: [],
              };
              acc.push(andarExistente);
            }

            andarExistente.variacoes.push({
              atributos: {
                nome: [{ valor: sala.nome }],
                area: [{ valor: sala.area.toString() }],
                posicao: [{ valor: sala.posicao }],
                disponibilidade: [{ valor: sala.disponivel }],
              },
              precos: {
                de: [{ valor: sala.preco.toString() }],
              },
              arquivos: {
                imagens: sala.imagem
                  ? [{ baixar: `/uploads/${sala.imagem}` }]
                  : [],
                plantas: sala.planta
                  ? [{ baixar: `/uploads/${sala.planta}` }]
                  : [],
              },
            });

            return acc;
          }, []),
        },
      ],
    });
  } catch (error) {
    console.error("Erro ao buscar salas:", error);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor",
    });
  }
});

// Buscar sala específica
router.get("/salas/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const sala = await prisma.sala.findUnique({
      where: { id: parseInt(id) },
    });

    if (!sala) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Sala não encontrada",
      });
    }

    res.json(sala);
  } catch (error) {
    console.error("Erro ao buscar sala:", error);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor",
    });
  }
});

// Criar nova sala
router.post(
  "/salas",
  authenticateAdmin,
  upload.fields([
    { name: "imagem", maxCount: 1 },
    { name: "planta", maxCount: 1 },
    { name: "proposta", maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    try {
      const {
        numero,
        andar,
        nome,
        area,
        posicao,
        orientacao,
        preco,
        disponivel,
        valorizacao,
        lucro,
        aluguel,
        condominio,
        iptu,
      } = req.body;

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const imagemFile = files?.imagem?.[0];
      const plantaFile = files?.planta?.[0];
      const propostaFile = files?.proposta?.[0];

      const sala = await prisma.sala.create({
        data: {
          numero,
          andar: parseInt(andar),
          nome,
          area: parseFloat(area),
          posicao,
          preco: parseFloat(preco),
          disponivel: disponivel === "true",
          imagem: imagemFile?.filename,
          planta: plantaFile?.filename,
          proposta: propostaFile?.filename,
        },
      });

      res.json({
        sucesso: true,
        mensagem: "Sala criada com sucesso!",
        data: sala,
      });
    } catch (error) {
      console.error("Erro ao criar sala:", error);
      res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno do servidor",
      });
    }
  },
);

// Atualizar sala
router.put(
  "/salas/:id",
  authenticateAdmin,
  upload.fields([
    { name: "imagem", maxCount: 1 },
    { name: "planta", maxCount: 1 },
    { name: "proposta", maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {
        numero,
        andar,
        nome,
        area,
        posicao,
        orientacao,
        preco,
        disponivel,
        valorizacao,
        lucro,
        aluguel,
        condominio,
        iptu,
      } = req.body;

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const imagemFile = files?.imagem?.[0];
      const plantaFile = files?.planta?.[0];
      const propostaFile = files?.proposta?.[0];

      const updateData: any = {
        numero,
        andar: parseInt(andar),
        nome,
        area: parseFloat(area),
        posicao,
        orientacao,
        preco: parseFloat(preco),
        disponivel: disponivel === "true",
      };

      if (imagemFile) updateData.imagem = imagemFile.filename;
      if (plantaFile) updateData.planta = plantaFile.filename;
      if (propostaFile) updateData.proposta = propostaFile.filename;

      const sala = await prisma.sala.update({
        where: { id: parseInt(id) },
        data: updateData,
      });

      res.json({
        sucesso: true,
        mensagem: "Sala atualizada com sucesso!",
        data: sala,
      });
    } catch (error) {
      console.error("Erro ao atualizar sala:", error);
      res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno do servidor",
      });
    }
  },
);

// Deletar sala
router.delete(
  "/salas/:id",
  authenticateAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await prisma.sala.delete({
        where: { id: parseInt(id) },
      });

      res.json({
        sucesso: true,
        mensagem: "Sala deletada com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao deletar sala:", error);
      res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno do servidor",
      });
    }
  },
);

export default router;
