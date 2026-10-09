'use client';

import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Edit3,
  ExternalLink, 
  Tag, 
  Percent, 
  ShoppingBag,
  DollarSign,
  X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

export default function SponsorsManagerPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('');
  const [sponsors, setSponsors] = useState<any[]>([]);

  // Form states (Criação e Edição)
  const [isEditing, setIsEditing] = useState(false);
  const [editingSponsorId, setEditingSponsorId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('nutrition');
  const [discountCode, setDiscountCode] = useState('');
  const [discountDescription, setDiscountDescription] = useState('');
  const [whatsappOrLink, setWhatsappOrLink] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Buscar apenas turmas do treinador logado (Isolamento Multi-Tenant)
      const { data: challengesData } = await supabase
        .from('challenges')
        .select('id, title')
        .eq('professional_id', user.id)
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

  const handleEditClick = (sp: any) => {
    setIsEditing(true);
    setEditingSponsorId(sp.id);
    setName(sp.name);
    setCategory(sp.category);
    setDiscountCode(sp.discount_code || '');
    setDiscountDescription(sp.discount_description);
    setWhatsappOrLink(sp.whatsapp_or_link || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingSponsorId(null);
    setName('');
    setDiscountCode('');
    setDiscountDescription('');
    setWhatsappOrLink('');
  };

  const handleSaveSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !discountDescription.trim() || !selectedChallengeId) return;

    setSubmitting(true);
    try {
      const payload = {
        challenge_id: selectedChallengeId,
        name: name.trim(),
        category,
        discount_code: discountCode.trim() || null,
        discount_description: discountDescription.trim(),
        whatsapp_or_link: whatsappOrLink.trim() || null,
      };

      if (isEditing && editingSponsorId) {
        // Update
        const { error } = await supabase
          .from('challenge_sponsors')
          .update(payload)
          .eq('id', editingSponsorId);

        if (error) throw error;
        setSponsors((prev) => prev.map((s) => (s.id === editingSponsorId ? { ...s, ...payload } : s)));
        handleCancelEdit();
      } else {
        // Insert
        const { data, error } = await supabase
          .from('challenge_sponsors')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        setSponsors([data, ...sponsors]);
        handleCancelEdit();
      }
    } catch (err) {
      console.error('Erro ao salvar parceiro:', err);
      alert('Erro ao salvar parceiro');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSponsor = async (id: string, spName: string) => {
    if (!confirm(`Deseja remover o patrocinador "${spName}" deste desafio?`)) return;

    try {
      const { error } = await supabase
        .from('challenge_sponsors')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSponsors(sponsors.filter((s) => s.id !== id));
      if (editingSponsorId === id) {
        handleCancelEdit();
      }
    } catch (err) {
      console.error('Erro ao deletar parceiro:', err);
      alert('Erro ao excluir parceiro');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Parceiros & Patrocinadores
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Cadastre, edite e remova marcas locais que oferecem cupons e prêmios para os alunos da turma.
          </p>
        </div>

        {challenges.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-zinc-400 font-mono">Turma:</span>
            <select
              value={selectedChallengeId}
              onChange={(e) => setSelectedChallengeId(e.target.value)}
              className="h-10 flex-1 sm:flex-initial rounded-xl border border-white/10 bg-zinc-900 px-3 text-xs font-bold text-white focus:outline-none focus:border-white/30 font-mono"
            >
              {challenges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de Cadastro / Edição */}
        <Card className="border-white/10 bg-zinc-900/50 h-fit">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2 text-white font-bold tracking-tight">
                {isEditing ? <Edit3 className="h-4 w-4 text-white" /> : <Plus className="h-4 w-4 text-white" />}
                {isEditing ? 'Editar Parceiro' : 'Novo Patrocinador'}
              </CardTitle>
              {isEditing && (
                <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="h-7 text-xs text-zinc-400 hover:text-white">
                  <X className="h-3.5 w-3.5 mr-1" /> Cancelar
                </Button>
              )}
            </div>
            <CardDescription className="text-xs text-zinc-400">
              {isEditing ? 'Atualize os dados e cupom do parceiro.' : 'Adicione uma loja de suplementos ou restaurante saudável.'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSaveSponsor} className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Nome da Empresa / Loja</label>
                <Input
                  type="text"
                  placeholder="Ex: Strong Nutrition & Suplementos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Nicho / Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-9 rounded-xl bg-zinc-950 border border-white/10 text-white px-3 focus:outline-none focus:border-white/30"
                >
                  <option value="nutrition">Suplementação & Nutrição</option>
                  <option value="apparel">Roupas & Moda Fitness</option>
                  <option value="restaurant">Restaurante / Marmitas Fit</option>
                  <option value="services">Fisioterapia / Estética</option>
                  <option value="other">Outro Nicho</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1 font-mono">Cupom de Desconto</label>
                  <Input
                    type="text"
                    placeholder="Ex: SHAPE15"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1 font-mono">Regra da Oferta</label>
                  <Input
                    type="text"
                    placeholder="Ex: 15% OFF"
                    value={discountDescription}
                    onChange={(e) => setDiscountDescription(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">WhatsApp ou Link da Loja</label>
                <Input
                  type="text"
                  placeholder="https://instagram.com/... ou WhatsApp"
                  value={whatsappOrLink}
                  onChange={(e) => setWhatsappOrLink(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-10 font-bold bg-white hover:bg-zinc-200 text-black shadow-lg shadow-white/5 mt-2 font-mono"
              >
                {submitting ? 'Salvando...' : isEditing ? 'Atualizar Patrocinador' : 'Publicar Patrocinador'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Patrocinadores com Edição e Exclusão */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-white/10 bg-zinc-900/50">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base text-white tracking-tight">Patrocinadores da Turma ({sponsors.length})</CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Cupons e benefícios exclusivos liberados para os alunos deste desafio.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              {sponsors.length === 0 && !loading ? (
                <div className="text-center py-12 text-zinc-500 text-xs">
                  <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Nenhum patrocinador cadastrado ainda. Use o formulário ao lado para cadastrar marcas parceiras.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {sponsors.map((sp) => (
                    <Card
                      key={sp.id}
                      className="border-white/10 bg-zinc-950/60 hover:border-white/25 transition-all p-4 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="border-white/20 text-white text-[10px] font-mono">
                            {sp.category}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(sp)}
                              className="h-7 w-7 text-zinc-400 hover:text-white"
                              title="Editar parceiro"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteSponsor(sp.id, sp.name)}
                              className="h-7 w-7 text-zinc-500 hover:text-white hover:bg-white/10 rounded"
                              title="Excluir parceiro"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        <h4 className="font-bold text-sm text-white">{sp.name}</h4>
                        <div className="mt-2.5 p-2 rounded-xl bg-zinc-900/80 border border-white/10 flex items-center justify-between">
                          <span className="text-xs font-black text-white font-mono">{sp.discount_description}</span>
                          {sp.discount_code && (
                            <span className="text-[11px] font-mono bg-white/10 border border-white/20 px-2 py-0.5 rounded text-white font-bold">
                              {sp.discount_code}
                            </span>
                          )}
                        </div>
                      </div>

                      {sp.whatsapp_or_link && (
                        <div className="mt-3 pt-2.5 border-t border-white/10 flex justify-end">
                          <a
                            href={sp.whatsapp_or_link.startsWith('http') ? sp.whatsapp_or_link : `https://${sp.whatsapp_or_link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-semibold font-mono"
                          >
                            Visitar Parceiro <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
