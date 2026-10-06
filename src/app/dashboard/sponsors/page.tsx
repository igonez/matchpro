'use client';

import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Tag, 
  Percent, 
  ShoppingBag,
  DollarSign
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

export default function SponsorsManagerPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('');
  const [sponsors, setSponsors] = useState<any[]>([]);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('nutrition');
  const [discountCode, setDiscountCode] = useState('');
  const [discountDescription, setDiscountDescription] = useState('');
  const [whatsappOrLink, setWhatsappOrLink] = useState('');
  const [creating, setCreating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: challengesData } = await supabase
        .from('challenges')
        .select('id, title')
        .order('created_at', { ascending: false });

      const safeCh = challengesData || [];
      setChallenges(safeCh);

      const targetChId = selectedChallengeId || (safeCh.length > 0 ? safeCh[0].id : '');
      if (!selectedChallengeId && targetChId) {
        setSelectedChallengeId(targetChId);
      }

      if (targetChId) {
        const { data: sp } = await supabase
          .from('challenge_sponsors')
          .select('*')
          .eq('challenge_id', targetChId)
          .order('created_at', { ascending: false });

        setSponsors(sp || []);
      }
    } catch (err) {
      console.error('Erro ao carregar parceiros:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedChallengeId]);

  const handleCreateSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !discountDescription.trim() || !selectedChallengeId) return;

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('challenge_sponsors')
        .insert({
          challenge_id: selectedChallengeId,
          name,
          category,
          discount_code: discountCode || null,
          discount_description: discountDescription,
          whatsapp_or_link: whatsappOrLink || null,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setSponsors([data, ...sponsors]);
        setName('');
        setDiscountCode('');
        setDiscountDescription('');
        setWhatsappOrLink('');
      }
    } catch (err) {
      console.error('Erro ao cadastrar parceiro:', err);
      alert('Não foi possível cadastrar o parceiro.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSponsor = async (id: string) => {
    if (!confirm('Deseja excluir este parceiro?')) return;
    try {
      await supabase.from('challenge_sponsors').delete().eq('id', id);
      setSponsors(sponsors.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Erro ao excluir parceiro:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/20 font-black tracking-wider uppercase text-[10px]">
            Monetização B2B & Ecossistema Local
          </Badge>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Building2 className="h-8 w-8 text-teal-400" />
          Vitrine de Parceiros & Patrocinadores
        </h1>
        <p className="text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
          Cadastre restaurantes fit, lojas de suplementos ou farmácias da sua região. Ofereça cupons exclusivos para seus alunos e cobre mensalidade de parceiros comerciais para exibi-los no seu app!
        </p>
      </div>

      {/* Seletor de Desafio */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Desafio Selecionado:
        </label>
        <select
          value={selectedChallengeId}
          onChange={(e) => setSelectedChallengeId(e.target.value)}
          className="h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs px-3 focus:outline-none focus:border-teal-500"
        >
          {challenges.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário de Criação */}
        <div className="lg:col-span-1">
          <Card className="border-zinc-800 bg-zinc-900/40 sticky top-24">
            <CardHeader>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-teal-400" /> Cadastrar Novo Parceiro
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Insira os dados do comércio e cupom de desconto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSponsor} className="space-y-4 text-xs">
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Nome do Estabelecimento *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Marmitaria Fit Vital / Loja Monster Suplementos"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-9 rounded-xl bg-zinc-950 border border-zinc-800 text-white px-3 focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-400 font-bold block mb-1">Categoria</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-9 rounded-xl bg-zinc-950 border border-zinc-800 text-white px-3 focus:outline-none focus:border-teal-400"
                    >
                      <option value="nutrition">Alimentação / Marmita Fit</option>
                      <option value="supplements">Suplementos & Vitaminas</option>
                      <option value="apparel">Roupas / Moda Fitness</option>
                      <option value="clinic">Clínica / Fisioterapia</option>
                      <option value="other">Outros</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-400 font-bold block mb-1">Cupom (Código)</label>
                    <input
                      type="text"
                      placeholder="Ex: TIMEPERSONAL15"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="w-full h-9 rounded-xl bg-zinc-950 border border-zinc-800 text-white px-3 focus:outline-none focus:border-teal-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Benefício / Desconto *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Ex: 15% OFF em todo o cardápio + frete grátis na primeira semana"
                    value={discountDescription}
                    onChange={(e) => setDiscountDescription(e.target.value)}
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 text-white p-3 focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Link de Pedido / WhatsApp (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: https://wa.me/5511999999999 ou https://site.com"
                    value={whatsappOrLink}
                    onChange={(e) => setWhatsappOrLink(e.target.value)}
                    className="w-full h-9 rounded-xl bg-zinc-950 border border-zinc-800 text-white px-3 focus:outline-none focus:border-teal-400"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={creating}
                  className="w-full h-10 font-bold bg-teal-500 hover:bg-teal-400 text-black shadow-lg shadow-teal-500/20"
                >
                  {creating ? 'Salvando...' : 'Cadastrar Parceiro'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Parceiros */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-teal-400" />
              Parceiros Ativos ({sponsors.length})
            </h2>
            <span className="text-xs text-zinc-500">Aparecem na aba de materiais do aluno</span>
          </div>

          {sponsors.length === 0 && !loading ? (
            <Card className="border-dashed border-zinc-800 p-8 text-center bg-zinc-900/20">
              <Building2 className="h-10 w-10 mx-auto text-zinc-600 mb-2" />
              <p className="font-semibold text-zinc-300">Nenhum parceiro cadastrado ainda</p>
              <p className="text-xs text-zinc-500 mt-1">
                Adicione o primeiro restaurante fit ou loja parceira para valorizar ainda mais o seu desafio.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sponsors.map((sp) => (
                <Card
                  key={sp.id}
                  className="border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition-all flex flex-col justify-between"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-1">
                      <Badge className="bg-teal-500/10 text-teal-300 border-teal-500/20 capitalize font-bold">
                        {sp.category === 'nutrition' ? 'Alimentação' : sp.category === 'supplements' ? 'Suplementação' : sp.category}
                      </Badge>
                      <button
                        onClick={() => handleDeleteSponsor(sp.id)}
                        className="text-zinc-600 hover:text-red-400 transition-colors p-1"
                        title="Excluir parceiro"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <CardTitle className="text-base font-black text-white">
                      {sp.name}
                    </CardTitle>

                    <CardDescription className="text-xs text-zinc-300 mt-1">
                      {sp.discount_description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0 border-t border-zinc-850 py-3 flex items-center justify-between">
                    {sp.discount_code ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950 border border-teal-500/30 text-teal-400 text-xs font-mono font-bold">
                        <Tag className="h-3 w-3" />
                        {sp.discount_code}
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-500">Sem código</span>
                    )}

                    {sp.whatsapp_or_link && (
                      <a
                        href={sp.whatsapp_or_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-teal-400 hover:underline flex items-center gap-1 font-bold"
                      >
                        Ver Link <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
