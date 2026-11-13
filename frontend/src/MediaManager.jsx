import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api, mediaAssetUrl } from './api.js'
import './media-manager.css'

const CATEGORIES = [
  { id: 'all', label: 'All assets' },
  { id: 'gallery', label: 'Gallery photos' },
  { id: 'course', label: 'Course images' },
  { id: 'event', label: 'Event posters' },
  { id: 'homepage', label: 'Homepage banner' }
]
const DESTINATIONS = [
  { id: 'gallery', label: 'Public gallery' },
  { id: 'course', label: 'A course' },
  { id: 'event', label: 'An event' },
  { id: 'homepage', label: 'Homepage banner' }
]
const titleOf = (item) => typeof item?.title === 'string' ? item.title : item?.title?.en || 'Untitled asset'
const idOf = (item) => String(item?._id || item?.id || '')
const formatBytes = (bytes = 0) => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
const prettyDate = (value) => value ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently uploaded'

export default function MediaManager() {
  const inputRef = useRef(null)
  const replaceInputsRef = useRef({})
  const [items, setItems] = useState([])
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [storage, setStorage] = useState('checking')
  const [maxUploadMb, setMaxUploadMb] = useState(5)
  const [selectedFile, setSelectedFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadCategory, setUploadCategory] = useState('gallery')
  const [title, setTitle] = useState('')
  const [altText, setAltText] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState({ type: '', text: '' })
  const [editing, setEditing] = useState(null)
  const [assigning, setAssigning] = useState(null)
  const [destination, setDestination] = useState('gallery')
  const [targetSlug, setTargetSlug] = useState('')
  const [courses, setCourses] = useState([])
  const [savingEdit, setSavingEdit] = useState(false)
  const [replacingId, setReplacingId] = useState('')

  const refresh = useCallback(async () => {
    try {
      const result = await api('/media/admin')
      setItems(result.assets || [])
      setStorage(result.storage || 'local')
      setMaxUploadMb(Number(result.maxUploadMb || 5))
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'Unable to load the media library.' })
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])
  useEffect(() => {
    api('/programs').then((courseData) => { setCourses(courseData.programs || []) }).catch(() => {})
  }, [])

  // Keep the page behind a dialog from scrolling, especially on touch devices.
  useEffect(() => {
    if (!editing && !assigning) return undefined
    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setEditing(null)
        setAssigning(null)
      }
    }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [editing, assigning])

  const filteredItems = useMemo(() => items.filter((item) => {
    const matchesCategory = category === 'all' || item.category === category
    const phrase = search.trim().toLowerCase()
    return matchesCategory && (!phrase || `${titleOf(item)} ${item.altText || ''} ${item.description || ''} ${item.originalName || ''}`.toLowerCase().includes(phrase))
  }), [items, category, search])
  const categoryCount = (key) => key === 'all' ? items.length : items.filter((item) => item.category === key).length

  const chooseFile = (file) => {
    setNotice({ type: '', text: '' })
    if (!file) return
    const rejectFile = (text) => {
      setSelectedFile(null)
      if (inputRef.current) inputRef.current.value = ''
      setNotice({ type: 'error', text })
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) return rejectFile('Please choose a JPG, PNG, or WEBP image. SVG and other file types are not accepted.')
    if (file.size > maxUploadMb * 1024 * 1024) return rejectFile(`This image exceeds the ${maxUploadMb} MB limit. Choose a smaller file.`)
    setSelectedFile(file)
    const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim()
    setTitle(baseName || 'Jamia media')
    setAltText(baseName || 'Jamia media')
  }

  const uploadAsset = async (event) => {
    event.preventDefault()
    if (!selectedFile) return setNotice({ type: 'error', text: 'Choose an image to upload first.' })
    if (!title.trim()) return setNotice({ type: 'error', text: 'Add a short, meaningful title.' })
    setBusy(true); setNotice({ type: '', text: '' })
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('category', uploadCategory)
      formData.append('title', title.trim())
      formData.append('altText', (altText.trim() || title.trim()))
      formData.append('description', description.trim())
      const result = await api('/media/admin/upload', { method: 'POST', body: formData })
      setNotice({ type: 'success', text: result.message || 'Image uploaded successfully.' })
      setSelectedFile(null); setTitle(''); setAltText(''); setDescription('')
      if (inputRef.current) inputRef.current.value = ''
      await refresh()
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'Upload failed. Please try again.' })
    } finally { setBusy(false) }
  }

  const replaceAsset = async (asset, file) => {
    if (!file) return
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setNotice({ type: 'error', text: 'Please choose a JPG, PNG, or WEBP image.' })
      return
    }
    if (file.size < 1 || file.size > maxUploadMb * 1024 * 1024) {
      setNotice({ type: 'error', text: `Choose an image larger than 0 bytes and no more than ${maxUploadMb} MB.` })
      return
    }
    const id = idOf(asset)
    setReplacingId(id)
    setNotice({ type: '', text: '' })
    try {
      const formData = new FormData()
      formData.append('file', file)
      const result = await api(`/media/admin/${id}/replace`, { method: 'POST', body: formData })
      setNotice({ type: 'success', text: result.message || 'Image replaced successfully.' })
      await refresh()
    } catch (error) {
      setNotice({ type: 'error', text: error?.message || 'Could not replace this image. Please try again.' })
    } finally {
      setReplacingId('')
    }
  }

  const saveEdit = async (event) => {
    event.preventDefault()
    if (!editing) return
    setSavingEdit(true)
    try {
      await api(`/media/admin/${idOf(editing)}`, { method: 'PATCH', body: JSON.stringify({ title: editing.title, altText: editing.altText || '', description: editing.description || '', category: editing.category }) })
      setNotice({ type: 'success', text: 'Media details updated.' }); setEditing(null); await refresh()
    } catch (error) { setNotice({ type: 'error', text: error?.message || 'Could not save image details. Please try again.' }) }
    finally { setSavingEdit(false) }
  }

  const applyAsset = async (event) => {
    event.preventDefault()
    if (!assigning) return
    try {
      const result = await api(`/media/admin/${idOf(assigning)}/apply`, { method: 'PATCH', body: JSON.stringify({ target: destination, targetSlug }) })
      setNotice({ type: 'success', text: result.message || 'Image applied successfully.' })
      setAssigning(null); await refresh()
    } catch (error) { setNotice({ type: 'error', text: error?.message || 'Could not apply this image. Please try again.' }) }
  }

  const deleteAsset = async (asset) => {
    if (!window.confirm(`Delete “${titleOf(asset)}” from secure storage? Any public page using this asset will be safely unlinked first.`)) return
    try {
      await api(`/media/admin/${idOf(asset)}`, { method: 'DELETE' })
      setNotice({ type: 'success', text: 'Image deleted and public references cleared.' })
      await refresh()
    } catch (error) { setNotice({ type: 'error', text: error?.message || 'Could not delete this image. Please try again.' }) }
  }

  return <div className="media-manager">
    <header className="mm-heading">
      <div><span className="mm-eyebrow">CONTENT STUDIO / ASSETS</span><h2>Media library<span className="mm-heading-dot">.</span></h2><p>One considered place for the imagery that represents the Jamia.</p></div>
      <div className={`mm-storage ${storage === 'cloudinary' ? 'is-ready' : 'is-offline'}`}><span className="mm-status-dot"/><span><strong>{storage === 'cloudinary' ? 'Cloudinary configured' : storage === 'local' ? 'Local server storage active' : 'Checking storage…'}</strong><small>{storage === 'cloudinary' ? 'Optimised cloud image delivery enabled' : storage === 'local' ? 'Stored securely on the server' : 'Checking available storage'}</small></span></div>
    </header>

    {notice.text && <div className={`mm-notice ${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'} aria-live={notice.type === 'error' ? 'assertive' : 'polite'} aria-atomic="true"><span className="mm-notice-icon" aria-hidden="true">{notice.type === 'success' ? '✓' : '!'}</span><div className="mm-notice-copy"><strong>{notice.type === 'success' ? 'Success' : 'Action needed'}</strong><p>{notice.text}</p></div><button type="button" onClick={() => setNotice({ type: '', text: '' })} aria-label="Dismiss notification">×</button></div>}

    <section className="mm-upload-panel">
      <div className="mm-panel-heading"><div><span className="mm-eyebrow">01 — ADD TO LIBRARY</span><h3>Upload an image</h3><p>Optimised delivery, carefully labelled assets, and a consistent visual library.</p></div><span className="mm-upload-limit">JPG · PNG · WEBP <i/> MAX {maxUploadMb} MB</span></div>
      {storage === 'local' && <div className="mm-config-hint"><strong>Local storage is ready.</strong> Images upload to your server’s <code>backend/uploads/media</code> folder. To enable Cloudinary delivery, set <code>CLOUDINARY_CLOUD_NAME</code>, <code>CLOUDINARY_API_KEY</code>, and <code>CLOUDINARY_API_SECRET</code> on the server, then restart it. Keep all secrets on the server only.</div>}
      {storage === 'cloudinary' && <div className="mm-config-hint"><strong>Cloudinary delivery is active.</strong> New uploads are delivered through Cloudinary with automatic format and quality optimization. Existing local images remain available until replaced or deleted.</div>}
      <form className="mm-upload-form" onSubmit={uploadAsset}>
        <div className={`mm-dropzone ${dragActive ? 'is-dragging' : ''} ${selectedFile ? 'has-file' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragActive(true) }} onDragLeave={() => setDragActive(false)} onDrop={(event) => { event.preventDefault(); setDragActive(false); chooseFile(event.dataTransfer.files?.[0]) }}>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => chooseFile(event.target.files?.[0])} aria-label="Choose an image" />
          {selectedFile ? <><span className="mm-drop-icon mm-drop-icon-ready">✓</span><strong>{selectedFile.name}</strong><small>{formatBytes(selectedFile.size)} · Ready to upload</small><button type="button" className="mm-browse-button mm-change-file" onClick={() => inputRef.current?.click()}>Change selected image</button></> : <><span className="mm-drop-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 15.5v3A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-3"/></svg></span><strong>Choose an image from your device</strong><small>On desktop, you can also drop an image into this area.</small><button type="button" className="mm-browse-button" onClick={() => inputRef.current?.click()}>Browse images <span aria-hidden="true">↗</span></button><small className="mm-upload-formats">JPG, PNG or WEBP · Up to {maxUploadMb} MB</small></>}
        </div>
        <div className="mm-upload-fields">
          <label className="mm-field"><span>Asset name <b>*</b></span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Hifz-ul-Quran programme" maxLength={160} required /></label>
          <label className="mm-field"><span>Library category</span><select value={uploadCategory} onChange={(event) => setUploadCategory(event.target.value)}><option value="gallery">Gallery photo</option><option value="course">Course image</option><option value="event">Event poster</option><option value="homepage">Homepage banner</option></select></label>
          <label className="mm-field"><span>Accessible image description</span><input value={altText} onChange={(event) => setAltText(event.target.value)} placeholder="Describe the image briefly" maxLength={240}/></label>
          <label className="mm-field"><span>Internal note <small>Optional</small></span><textarea rows="2" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Add context for the Jamia team" maxLength={1000}/></label>
          <button className="mm-primary-button" type="submit" disabled={busy || !['cloudinary', 'local'].includes(storage)}>{busy ? <><span className="mm-spinner"/> Uploading securely…</> : <>Upload to library <span>↗</span></>}</button>
        </div>
      </form>
    </section>

    <section className="mm-library-panel">
      <div className="mm-panel-heading mm-library-heading"><div><span className="mm-eyebrow">02 — YOUR ASSETS</span><h3>Organise the collection</h3><p>Find an image, update its details, or connect it to a public page.</p></div><div className="mm-asset-total"><strong>{items.length.toString().padStart(2, '0')}</strong><span>stored assets</span></div></div>
      <div className="mm-toolbar"><div className="mm-tabs" role="tablist" aria-label="Filter media by category">{CATEGORIES.map((item) => <button type="button" role="tab" aria-selected={category === item.id} className={category === item.id ? 'active' : ''} key={item.id} onClick={() => setCategory(item.id)}>{item.label}<span>{categoryCount(item.id)}</span></button>)}</div><label className="mm-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.4 4.4"/></svg><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the library…" aria-label="Search media library"/><kbd>⌕</kbd></label></div>
      {filteredItems.length ? <div className="mm-grid">{filteredItems.map((asset) => <article className="mm-asset-card" key={idOf(asset)}><div className="mm-asset-image"><img src={mediaAssetUrl(asset.url)} alt={asset.altText || titleOf(asset)} loading="lazy"/><span className={`mm-category-tag tag-${asset.category}`}>{asset.category === 'homepage' ? 'Homepage banner' : asset.category === 'course' ? 'Course image' : asset.category === 'event' ? 'Event poster' : 'Gallery photo'}</span><a href={mediaAssetUrl(asset.url)} target="_blank" rel="noreferrer" className="mm-open-image" aria-label={`Open ${titleOf(asset)} in a new tab`}>↗</a></div><div className="mm-asset-meta"><h4 title={titleOf(asset)}>{titleOf(asset)}</h4><p>{asset.width && asset.height ? `${asset.width} × ${asset.height} px` : 'Image asset'} <i/> {formatBytes(asset.bytes)} <i/> {prettyDate(asset.createdAt)}</p><div className="mm-asset-actions"><input className="mm-replace-input" ref={(node) => { if (node) replaceInputsRef.current[idOf(asset)] = node; else delete replaceInputsRef.current[idOf(asset)] }} type="file" accept="image/jpeg,image/png,image/webp" aria-label={`Choose a replacement for ${titleOf(asset)}`} onChange={(event) => { const file = event.target.files?.[0]; void replaceAsset(asset, file); event.target.value = '' }} /><button type="button" onClick={() => replaceInputsRef.current[idOf(asset)]?.click()} disabled={replacingId === idOf(asset)}>{replacingId === idOf(asset) ? 'Replacing…' : 'Replace'}</button><button type="button" onClick={() => setAssigning(asset)}>Apply to page <span>↗</span></button><button type="button" onClick={() => setEditing({ ...asset, title: titleOf(asset) })}>Edit</button><button type="button" className="mm-delete-button" onClick={() => deleteAsset(asset)} aria-label={`Delete ${titleOf(asset)}`}>Delete</button></div></div></article>)}</div> : <div className="mm-empty"><span className="mm-empty-icon">◇</span><h4>{search || category !== 'all' ? 'No matching images' : 'Your library starts here'}</h4><p>{search || category !== 'all' ? 'Try a different search or category.' : 'Upload your first approved Jamia image above. It will appear here ready to manage and publish.'}</p>{(search || category !== 'all') && <button type="button" className="mm-inline-link" onClick={() => { setSearch(''); setCategory('all') }}>Clear filters</button>}</div>}
      <div className="mm-library-footer"><span><span className="mm-mini-shield">✓</span> Admin-only library · Authenticated requests</span><span>Showing {filteredItems.length} of {items.length} assets</span></div>
    </section>

    {editing && <div className="mm-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null) }}><form className="mm-modal" role="dialog" aria-modal="true" onSubmit={saveEdit} aria-labelledby="mm-edit-title"><button type="button" className="mm-modal-close" onClick={() => setEditing(null)} aria-label="Close editor">×</button><span className="mm-eyebrow">ASSET DETAILS</span><h3 id="mm-edit-title">Edit image information</h3><label className="mm-field"><span>Asset name</span><input value={editing.title || ''} onChange={(event) => setEditing({ ...editing, title: event.target.value })} maxLength={160} required/></label><label className="mm-field"><span>Accessible image description</span><input value={editing.altText || ''} onChange={(event) => setEditing({ ...editing, altText: event.target.value })} maxLength={240}/></label><label className="mm-field"><span>Internal note</span><textarea value={editing.description || ''} onChange={(event) => setEditing({ ...editing, description: event.target.value })} rows="3" maxLength={1000}/></label><label className="mm-field"><span>Category</span><select value={editing.category} onChange={(event) => setEditing({ ...editing, category: event.target.value })}>{CATEGORIES.filter((item) => item.id !== 'all').map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><div className="mm-modal-actions"><button type="button" className="mm-secondary-button" onClick={() => setEditing(null)}>Cancel</button><button className="mm-primary-button" type="submit" disabled={savingEdit}>{savingEdit ? 'Saving…' : 'Save changes'}</button></div></form></div>}

    {assigning && <div className="mm-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setAssigning(null) }}><form className="mm-modal" role="dialog" aria-modal="true" onSubmit={applyAsset} aria-labelledby="mm-apply-title"><button type="button" className="mm-modal-close" onClick={() => setAssigning(null)} aria-label="Close apply dialog">×</button><span className="mm-eyebrow">PUBLISH IMAGE</span><h3 id="mm-apply-title">Where should this image go?</h3><div className="mm-apply-preview"><img src={mediaAssetUrl(assigning.url)} alt={assigning.altText || titleOf(assigning)}/><span><strong>{titleOf(assigning)}</strong><small>Original remains in your media library.</small></span></div><label className="mm-field"><span>Destination</span><select value={destination} onChange={(event) => { setDestination(event.target.value); setTargetSlug('') }}>{DESTINATIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>{destination === 'course' && <label className="mm-field"><span>Choose course</span><select value={targetSlug} onChange={(event) => setTargetSlug(event.target.value)} required><option value="">Select a course…</option>{courses.map((item) => <option key={idOf(item)} value={item.slug}>{titleOf(item)}</option>)}</select></label>}{destination === 'event' && <p className="mm-modal-help">The event poster will be published to the public event gallery. This site does not yet use a separate event records module.</p>}<p className="mm-modal-help">{destination === 'homepage' ? 'This replaces the main homepage banner.' : destination === 'gallery' ? 'This publishes a copy of the image in the public Gallery page.' : destination === 'course' ? 'This updates the selected course image on programme cards and its detail page.' : 'This updates the selected event poster.'}</p><div className="mm-modal-actions"><button type="button" className="mm-secondary-button" onClick={() => setAssigning(null)}>Cancel</button><button className="mm-primary-button" type="submit">Apply image <span>↗</span></button></div></form></div>}
  </div>
}
