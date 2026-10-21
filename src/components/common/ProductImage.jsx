export default function ProductImage({ src, alt = '', ...props }) {
  return <img {...props} src={typeof src === 'string' && src ? src : '/product-placeholder.svg'} alt={alt} onError={event => { if (!event.currentTarget.src.endsWith('/product-placeholder.svg')) event.currentTarget.src = '/product-placeholder.svg'; }} />;
}
