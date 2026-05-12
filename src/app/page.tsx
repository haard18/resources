'use client'

import { useState, useEffect, KeyboardEvent } from 'react'

interface Tag {
  id: number
  name: string
}

interface Resource {
  id: number
  title: string
  link: string
  description: string
  submittedBy: string
  createdAt: string
  tags: { tag: Tag }[]
}

const TEAM_MEMBERS = [
  { name: 'shamik', label: 'Shamik (Founder)' },
  { name: 'haard', label: 'Haard' },
  { name: 'bhargav', label: 'Bhargav' },
  { name: 'sameer', label: 'Sameer' },
  { name: 'arun', label: 'Arun' },
]

const MEMBER_COLORS: Record<string, string> = {
  shamik: '#7c5cff',
  haard: '#3a9c5c',
  bhargav: '#c73e3e',
  sameer: '#d4883a',
  arun: '#3a7cc7',
}

export default function Home() {
  const [resources, setResources] = useState<Resource[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [filter, setFilter] = useState<string>('')
  const [tagFilter, setTagFilter] = useState<string>('')
  const [form, setForm] = useState({ title: '', link: '', description: '', submittedBy: 'haard' })
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [tagInput, setTagInput] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchResources = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter) params.set('submittedBy', filter)
    if (tagFilter) params.set('tag', tagFilter)
    const url = `/api/resources${params.toString() ? '?' + params.toString() : ''}`
    const res = await fetch(url)
    const data = await res.json()
    setResources(data)
    setLoading(false)
  }

  const fetchTags = async () => {
    const res = await fetch('/api/tags')
    const data = await res.json()
    setTags(data)
  }

  useEffect(() => {
    fetchResources()
    fetchTags()
  }, [filter, tagFilter])

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const name = tagInput.trim().toLowerCase()
      if (name && !selectedTags.find(t => t.name === name)) {
        const existing = tags.find(t => t.name === name)
        if (existing) {
          setSelectedTags([...selectedTags, existing])
        } else {
          setSelectedTags([...selectedTags, { id: Date.now(), name }])
        }
        setTagInput('')
      }
    }
    if (e.key === 'Backspace' && !tagInput && selectedTags.length) {
      setSelectedTags(selectedTags.slice(0, -1))
    }
  }

  const removeTag = (tagName: string) => {
    setSelectedTags(selectedTags.filter(t => t.name !== tagName))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        tags: selectedTags.map(t => t.name),
      }),
    })
    setForm({ title: '', link: '', description: '', submittedBy: form.submittedBy })
    setSelectedTags([])
    setTagInput('')
    setShowForm(false)
    fetchResources()
    fetchTags()
  }

  const handleDelete = async (id: number) => {
    await fetch(`/api/resources?id=${id}`, { method: 'DELETE' })
    fetchResources()
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="container">
      <header>
        <h1>Resource Share</h1>
        <p className="subtitle">Drop links, save knowledge</p>
      </header>

      <div className="controls">
        <div className="filter-group">
          <label htmlFor="filter">By</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">Everyone</option>
            {TEAM_MEMBERS.map((m) => (
              <option key={m.name} value={m.name}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="tagFilter">Tag</label>
          <select
            id="tagFilter"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          >
            <option value="">All tags</option>
            {tags.map((t) => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Close' : '+ Add Resource'}
        </button>
      </div>

      {showForm && (
        <form className="add-form" onSubmit={handleSubmit}>
          <h2>Add a resource</h2>
          <div className="form-row">
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <input
              type="url"
              placeholder="https://..."
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              required
            />
          </div>
          <div className="form-row">
            <textarea
              placeholder="Brief description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
            />
            <select
              value={form.submittedBy}
              onChange={(e) => setForm({ ...form, submittedBy: e.target.value })}
            >
              {TEAM_MEMBERS.map((m) => (
                <option key={m.name} value={m.name}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="tag-input-container">
              <div className="tag-input-display">
                {selectedTags.map(tag => (
                  <span key={tag.name} className="tag-chip">
                    {tag.name}
                    <button type="button" onClick={() => removeTag(tag.name)}>×</button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Add tags (press Enter)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="tag-input-field"
                />
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit">Save Resource</button>
          </div>
        </form>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', padding: '2rem' }}>Loading...</p>
      ) : resources.length === 0 ? (
        <div className="empty-state">
          <h2>Nothing here yet</h2>
          <p>Be the first to drop a resource!</p>
        </div>
      ) : (
        <div className="resources">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="resource-card"
              style={{ '--member-color': MEMBER_COLORS[resource.submittedBy] } as React.CSSProperties}
            >
              <div className="resource-meta">
                <span
                  className="submitter-badge"
                  style={{ borderColor: MEMBER_COLORS[resource.submittedBy], color: MEMBER_COLORS[resource.submittedBy] }}
                >
                  {resource.submittedBy}
                </span>
                <button
                  onClick={() => handleDelete(resource.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    boxShadow: 'none',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    color: '#999',
                    cursor: 'pointer',
                  }}
                >
                  ×
                </button>
              </div>
              <h3 className="resource-title">
                <a href={resource.link} target="_blank" rel="noopener noreferrer">
                  {resource.title}
                </a>
              </h3>
              {resource.description && (
                <p className="resource-description">{resource.description}</p>
              )}
              {resource.tags.length > 0 && (
                <div className="resource-tags">
                  {resource.tags.map(({ tag }) => (
                    <span key={tag.id} className="tag-badge">{tag.name}</span>
                  ))}
                </div>
              )}
              <a href={resource.link} target="_blank" rel="noopener noreferrer" className="resource-link">
                {resource.link.length > 50 ? resource.link.slice(0, 50) + '...' : resource.link} →
              </a>
              <span className="resource-date" style={{ marginLeft: '1rem' }}>
                {formatDate(resource.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}