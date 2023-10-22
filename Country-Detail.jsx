import { Card, Spinner, Form, Button, Breadcrumb, Toast, ToastContainer, Collapse } from "solid-bootstrap";
import { createSignal, onMount } from "solid-js";
import { useParams } from "@solidjs/router";
import { createClient } from '@supabase/supabase-js';
import { createStore } from "solid-js/store";

const CountryDetails = (props) => {
    const id = useParams().id
    const [showToggle, setShowToggle] = createSignal(false)
    const [loading, setLoading] = createSignal(false)
    const [isHandling, setIsHandling] = createSignal(false)
    const supabase = createClient('https://vxudiapfzrpthkojjahj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4dWRpYXBmenJwdGhrb2pqYWhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODY1NjQ3ODAsImV4cCI6MjAwMjE0MDc4MH0.hd9QH9zb0_e1lkztnvEjaa6wntSYKthtZMdyp8s3oZw')
    const [form, setForm] = createStore({
        id: '',
        country_code: '',
        iso_codes: '',
        population: '',
        area_km2: '',
        gdp: ''
    })

    onMount(() => {
        const getCountryDetail = async () => {
            setLoading(true)
            const { data, error } = await supabase
                .from('countries')
                .select()
                .eq('id', id)

            setForm(data[0])
            setLoading(false)
        }
        getCountryDetail()
    })

    const updateCountry = async (id, event) => {
        console.log('handle to update country as', form)
        event.preventDefault()
        setIsHandling(true)
        await supabase.from('countries').update(form).eq('id', id).then(rs => {
            console.log('updated')
            setIsHandling(false)
            showToggleTimeout()
        })
    }

    const deleteCountry = async (id, event) => {
        console.log('handle to delete country id as', id)
        event.preventDefault()
        setIsHandling(true)
        await supabase.from('countries').delete().eq('id', id).then(rs => {
            console.log('deleted')
            setIsHandling(false)
            window.location.href = "/countries";
        })
    }

    const showToggleTimeout = () => {
        setShowToggle(true)
        setTimeout(() => {
            setShowToggle(false)
        }, 5000)
    }

    const closeToggle = () => {
        setShowToggle(false)
    }

    const updateFormField = (fieldName, event) => {
        setForm({
            [fieldName]: event.currentTarget.value
        })
    }

    return (
        <>
            <header>
                <h1>Country Detail</h1>
                <Breadcrumb>
                    <Breadcrumb.Item href="/countries">Countries</Breadcrumb.Item>
                    <Breadcrumb.Item active>{form.name}</Breadcrumb.Item>
                </Breadcrumb>
            </header>
            <section>
                {
                    loading() && (
                        <div class="text-center">
                            <Spinner animation="border" role="status" variant="dark" />
                            <h5>Loading...</h5>
                        </div>
                    )
                }

                {
                    form.id != '' && (
                        <>
                            <Card style={{ width: '18rem' }} class="shadow mb-3">
                                <Card.Img variant="top" src={form.image} />
                                <Card.Body>
                                    <Card.Title>{form.name}</Card.Title>
                                    <Form>
                                        <Form.Group className="mb-3" controlId="countryForm.country_code">
                                            <Form.Label>Country Code</Form.Label>
                                            <Form.Control type="text" placeholder="Country Code" value={form.country_code} onChange={[updateFormField, 'country_code']} />
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="countryForm.iso_codes">
                                            <Form.Label>ISO Codes</Form.Label>
                                            <Form.Control type="text" placeholder="ISO Codes" value={form.iso_codes} onChange={[updateFormField, 'iso_codes']} />
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="countryForm.population">
                                            <Form.Label>Population</Form.Label>
                                            <Form.Control type="text" placeholder="Population" value={form.population} onChange={[updateFormField, 'population']} />
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="countryForm.area_km2">
                                            <Form.Label>Area Km2</Form.Label>
                                            <Form.Control type="text" placeholder="Area Km2" value={form.area_km2} onChange={[updateFormField, 'area_km2']} />
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="countryForm.gdp">
                                            <Form.Label>GDP $USD</Form.Label>
                                            <Form.Control type="text" placeholder="GDP $USD" value={form.gdp} onChange={[updateFormField, 'gdp']} />
                                        </Form.Group>
                                        <Button style={{ width: '13vh' }} onClick={[updateCountry, form.id]} class="mt-3" variant="dark">Update</Button>
                                        <Button style={{ width: '13vh' }} onClick={[deleteCountry, form.id]} class="mt-3 ms-1" variant="danger">Delete</Button>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </>
                    )
                }
            </section>
            <br />
            {/* Toats Model */}
            <ToastContainer
                className="position-fixed bottom-0 end-0 p-3"
                style={{ zIndex: 1 }}
            >
                <Toast show={showToggle()} onClose={closeToggle()} animation transition={Collapse}>
                    <Toast.Header class="toast-header">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                            <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z" />
                        </svg>
                        <strong className="me-auto ms-1">Notification</strong>
                        <small>Just now</small>
                    </Toast.Header>
                    <Toast.Body class="toast-body">Function Success!</Toast.Body>
                </Toast>
            </ToastContainer>

            {/* Overlay Screen */}
            {
                isHandling() && (
                    <div class="overlay">
                        <div class="overlay__inner">
                            <div class="overlay__content"><span class="spinner"></span></div>
                        </div>
                    </div>
                )
            }
        </>
    )
}

export default CountryDetails