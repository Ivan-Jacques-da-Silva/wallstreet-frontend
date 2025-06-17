import { Request, Response, NextFunction } from 'express';
export declare const registrarHistorico: (req: Request, operacao: string, tabela: string, registroId?: number | null, dadosAntes?: any, dadosDepois?: any) => Promise<void>;
export declare const auditarOperacao: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auditoria.d.ts.map