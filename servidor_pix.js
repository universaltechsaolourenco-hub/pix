const express = require('express');
const cors = require('cors');

const app = express();

// Permite que o seu site (Frontend) comunique com este servidor
app.use(cors({ origin: '*' }));
app.use(express.json());

// ==========================================
// SEU TOKEN DO MERCADO PAGO FICA PROTEGIDO AQUI
// ==========================================
const MP_ACCESS_TOKEN = 'APP_USR-3564026441946567-022108-33fe213847500574a266d1fa3fc98b9e-676666420';

// Rota 1: Gerar o PIX
app.post('/api/pix', async (req, res) => {
    try {
        const { amount } = req.body;
        
        // Faz a chamada oficial ao Mercado Pago de forma escondida do navegador
        const response = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': crypto.randomUUID()
            },
            body: JSON.stringify({
                transaction_amount: Number(amount),
                description: 'Venda PDV - Primetech',
                payment_method_id: 'pix',
                payer: { 
                    email: 'cliente@primetech.com.br',
                    first_name: 'Cliente',
                    last_name: 'Primetech' 
                }
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro ao gerar PIX no Mercado Pago');
        }

        res.json(data);
    } catch (error) {
        console.error("Erro na API PIX:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Rota 2: Verificar o status do pagamento
app.get('/api/pix/:id', async (req, res) => {
    try {
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${req.params.id}`, {
            headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` }
        });
        const data = await response.json();
        res.json({ status: data.status });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao verificar status' });
    }
});

// Inicia o servidor (O Render preenche o process.env.PORT automaticamente)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor backend a correr na porta ${PORT}`);
});