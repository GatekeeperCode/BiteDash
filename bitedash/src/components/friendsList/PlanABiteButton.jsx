import Button from 'react-bootstrap/Button';

export default function PlanABiteButton({ onSelect }) {
    return (
        <div class="d-flex justify-content-center mb-2">
            <Button onClick={onSelect} variant='dark' size='lg' class="text-center" style={{ width: "300px", display:"flex", justifyContent:"center"}}>
            Plan a Bite
            </Button>
        </div>
    );
}