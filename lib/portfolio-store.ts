import { Redis } from '@upstash/redis';
import { promises as fs } from 'fs';
import path from 'path';
import { CareerProfile } from './career-types';

export interface PublishedPortfolio {
  slug: string;
  profile: CareerProfile;
  publishedAt: string;
}

function getRedisClient(): Redis | null {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return null;
}

const LOCAL_STORE_PATH = path.join(process.cwd(), '.data', 'portfolios.json');

async function readLocalStore(): Promise<Record<string, PublishedPortfolio>> {
  try {
    const raw = await fs.readFile(LOCAL_STORE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeLocalStore(data: Record<string, PublishedPortfolio>): Promise<void> {
  await fs.mkdir(path.dirname(LOCAL_STORE_PATH), { recursive: true });
  await fs.writeFile(LOCAL_STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export function slugifyName(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return base || 'portfolio';
}

export async function savePublishedPortfolio(
  slug: string,
  profile: CareerProfile
): Promise<PublishedPortfolio> {
  const record: PublishedPortfolio = {
    slug,
    profile,
    publishedAt: new Date().toISOString(),
  };

  const redis = getRedisClient();
  if (redis) {
    await redis.set(`portfolio:${slug}`, record);
    return record;
  }

  const store = await readLocalStore();
  store[slug] = record;
  await writeLocalStore(store);
  return record;
}

export async function getPublishedPortfolio(slug: string): Promise<PublishedPortfolio | null> {
  const redis = getRedisClient();
  if (redis) {
    const data = await redis.get<PublishedPortfolio>(`portfolio:${slug}`);
    return data || null;
  }

  const store = await readLocalStore();
  return store[slug] || null;
}
