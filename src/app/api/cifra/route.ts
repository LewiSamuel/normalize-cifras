import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Parâmetro "url" é obrigatório.' }, { status: 400 });
  }

  try {
    // Faz a requisição HTTP para o site do Cifra Club
    const response = await axios.get(url);

    // Carrega o HTML na cheerio
    const $ = cheerio.load(response.data);

    // O conteúdo da cifra geralmente está dentro de uma <pre> ou div específica
    const cifraContent = $('.cifra_cnt pre').text() || $('.cifra-mono pre').text();

    if (!cifraContent) {
      return NextResponse.json({ error: 'Conteúdo da cifra não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ cifra: cifraContent });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar a cifra.' }, { status: 500 });
  }
}