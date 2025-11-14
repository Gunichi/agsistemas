interface FooterProps {
  textColor: string
}
export default function Footer({ textColor }: FooterProps) {
  return (
    <footer className="container mx-auto px-4 py-6">
      <div className={`text-center text-${textColor}`}>
        <p> {new Date().getFullYear()} - Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}