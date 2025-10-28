import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Package, HelpCircle, Share2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard({ user }) {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    faqs: 0,
    socialMedia: 0
  })

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/')
      return
    }

    // Mock data - substituir por chamada à API
    setStats({
      users: 150,
      products: 24,
      faqs: 12,
      socialMedia: 3
    })
  }, [user, navigate])

  if (!user || !user.isAdmin) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-foreground">Painel Administrativo</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
            <p className="text-xs text-muted-foreground">Total de usuários cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products}</div>
            <p className="text-xs text-muted-foreground">Produtos no catálogo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">FAQs</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.faqs}</div>
            <p className="text-xs text-muted-foreground">Perguntas frequentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Redes Sociais</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.socialMedia}</div>
            <p className="text-xs text-muted-foreground">Links configurados</p>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="social">Redes Sociais</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Usuários</CardTitle>
              <CardDescription>Visualize, edite e exclua usuários</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Lista de usuários cadastrados no sistema
              </p>
              <Button>Ver Todos os Usuários</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Produtos</CardTitle>
              <CardDescription>Crie, edite e exclua produtos do catálogo</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Gerencie o catálogo de produtos
              </p>
              <div className="flex gap-2">
                <Button>Novo Produto</Button>
                <Button variant="outline">Ver Produtos</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faqs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar FAQs</CardTitle>
              <CardDescription>Crie e edite perguntas frequentes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Mantenha as perguntas frequentes atualizadas
              </p>
              <div className="flex gap-2">
                <Button>Nova FAQ</Button>
                <Button variant="outline">Ver FAQs</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Redes Sociais</CardTitle>
              <CardDescription>Configure os links das redes sociais</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Adicione e edite links das redes sociais
              </p>
              <div className="flex gap-2">
                <Button>Nova Rede Social</Button>
                <Button variant="outline">Ver Links</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

