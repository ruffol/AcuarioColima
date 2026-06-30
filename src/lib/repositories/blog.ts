import type { BlogPost, BlogPostFormData } from '@/types'
import { useDb, parseJson, boolToInt, intToBool } from './base'

function rowToPost(row: any): BlogPost {
  return {
    ...row,
    tags: parseJson<string[]>(row.tags, []),
    published: intToBool(row.published),
  }
}

export function getPosts(publishedOnly = false): BlogPost[] {
  const db = useDb()
  let sql = 'SELECT * FROM blog_posts'
  if (publishedOnly) sql += ' WHERE published = 1'
  sql += ' ORDER BY created_at DESC'
  return (db.prepare(sql).all() as any[]).map(rowToPost)
}

export function getPostBySlug(slug: string): BlogPost | null {
  const db = useDb()
  const row = db.prepare('SELECT * FROM blog_posts WHERE slug = ?').get(slug) as any
  return row ? rowToPost(row) : null
}

export function upsertPost(data: BlogPostFormData & { id?: number }): BlogPost {
  const db = useDb()
  const row = {
    ...data,
    tags: JSON.stringify(data.tags || []),
    published: boolToInt(data.published),
  }
  if (data.id) {
    db.prepare(`
      UPDATE blog_posts SET slug=@slug, title_es=@title_es, title_en=@title_en,
        content_es=@content_es, content_en=@content_en,
        excerpt_es=@excerpt_es, excerpt_en=@excerpt_en,
        image=@image, tags=@tags, author=@author, published=@published,
        updated_at=datetime('now')
      WHERE id = @id
    `).run(row)
    return db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(data.id) as BlogPost
  }
  const result = db.prepare(`
    INSERT INTO blog_posts (slug, title_es, title_en, content_es, content_en,
      excerpt_es, excerpt_en, image, tags, author, published)
    VALUES (@slug, @title_es, @title_en, @content_es, @content_en,
      @excerpt_es, @excerpt_en, @image, @tags, @author, @published)
  `).run(row)
  return db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(result.lastInsertRowid) as BlogPost
}

export function deletePost(id: number) {
  useDb().prepare('DELETE FROM blog_posts WHERE id = ?').run(id)
}
