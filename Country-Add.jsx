import { Card, Spinner, Form, Button, Breadcrumb, FloatingLabel, Collapse, Toast, ToastContainer } from "solid-bootstrap";
import { createSignal } from "solid-js";
import { createClient } from '@supabase/supabase-js';
import { createStore } from "solid-js/store";
import { useForm } from "./validation";
import "./Country-Add.css";

const ErrorMessage = (props) => <span class="error-message">{props.error}</span>

const CountryAdd = () => {
    const [isHandling, setIsHandling] = createSignal(false)
    const [showToggle, setShowToggle] = createSignal(false)
    const supabase = createClient('https://vxudiapfzrpthkojjahj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4dWRpYXBmenJwdGhrb2pqYWhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODY1NjQ3ODAsImV4cCI6MjAwMjE0MDc4MH0.hd9QH9zb0_e1lkztnvEjaa6wntSYKthtZMdyp8s3oZw')
    const [form, setForm] = createStore({
        name: '',
        country_code: '',
        iso_codes: '',
        population: '',
        area_km2: '',
        gdp: ''
    })

    // Validation
    const { validate, formSubmit, errors } = useForm({
        errorClass: "error-input"
    })

    const validateCountryCode = async ({ value }) => {
        console.log('validate format country code', value)
        var regex = /^(\+?\d{1,3}|\d{1,2}-\d{1,3})$/gm
        var match = value.match(regex)
        if (match == null) {
            return 'Correct format: d{1,3} | d{1,2}-d{1,3}'
        }

        console.log('validate duplicate country code', value)
        const { data, error } = await supabase
            .from('countries')
            .select()
            .eq('country_code', value)
        if (data.length > 0) {
            return 'Country code already exist'
        } else {
            return false
        }
    }

    const fnSubmitForm = async () => {
        console.log("Handle submit with data", form)
        setIsHandling(true)
        await supabase.from('countries').insert(form).then(rs => {
            console.log('inserted')
            setForm({
                name: '',
                country_code: '',
                iso_codes: '',
                population: '',
                area_km2: '',
                gdp: ''
            })
            blah.src = '#'
            imgInp.value = ''
            setIsHandling(false)
            showToggleTimeout()
        })
    }

    const showToggleTimeout = () => {
        setShowToggle(true)
        setTimeout(() => {
            setShowToggle(false)
        }, 5000)
    }

    const updateFormField = (fieldName, event) => {
        setForm({
            [fieldName]: event.currentTarget.value
        })
    }

    const onChangeImage = (data, event) => {
        const [file] = imgInp.files

        // Render to preview image
        if (file) {
            blah.src = URL.createObjectURL(file)
        }

        // Convert image to base64
        let reader = new FileReader()
        reader.onloadend = function () {
            console.log('converted to base64', reader.result)
            setForm({
                'image': reader.result
            })
        }
        reader.readAsDataURL(file)
    }

    const closeToggle = () => {
        setShowToggle(false)
    }

    return (
        <>
            <header>
                <h1>Country Add</h1>
                <Breadcrumb>
                    <Breadcrumb.Item href="/countries">Countries</Breadcrumb.Item>
                    <Breadcrumb.Item active>Add</Breadcrumb.Item>
                </Breadcrumb>
            </header>
            <section>
                <Card style={{ width: '18rem' }} class="shadow">
                    <Card.Body>
                        <Form.Group controlId="countryForm.image" className="mb-3">
                            <input class="form-control" accept="image/*" type='file' id="imgInp" onChange={[onChangeImage, 'image']} />
                            <img id="blah" src="#" class="card-img-top" alt="Country Image" />
                        </Form.Group>
                        <form use:formSubmit={fnSubmitForm}>
                            <FloatingLabel
                                controlId="countryForm.country_name"
                                label="Country Name*"
                                class="mb-3"
                            >
                                <input type="text" class="form-control" placeholder="Country Name" name="country_name" required use:validate onChange={[updateFormField, 'name']} value={form.name} />
                                {errors.country_name && <ErrorMessage error={errors.country_name} />}
                            </FloatingLabel>

                            <FloatingLabel
                                controlId="countryForm.country_code"
                                label="Country Code*"
                                class="mb-3"
                            >
                                <input type="text" class="form-control" placeholder="Country Code" name="country_code" required use:validate={[validateCountryCode]} onChange={[updateFormField, 'country_code']} value={form.country_code} />
                                {errors.country_code && <ErrorMessage error={errors.country_code} />}
                            </FloatingLabel>

                            <FloatingLabel
                                controlId="countryForm.iso_codes"
                                label="ISO Codes"
                                class="mb-3"
                            >
                                <Form.Control type="text" placeholder="ISO Codes" onChange={[updateFormField, 'iso_codes']} value={form.iso_codes} />
                            </FloatingLabel>

                            <FloatingLabel
                                controlId="countryForm.population"
                                label="Population"
                                class="mb-3"
                            >
                                <Form.Control type="text" placeholder="Population" onChange={[updateFormField, 'population']} value={form.population} />
                            </FloatingLabel>

                            <FloatingLabel
                                controlId="countryForm.area_km2"
                                label="Area Km2"
                                class="mb-3"
                            >
                                <Form.Control type="text" placeholder="Area Km2" onChange={[updateFormField, 'area_km2']} value={form.area_km2} />
                            </FloatingLabel>

                            <FloatingLabel
                                controlId="countryForm.gdp"
                                label="GDP"
                                class="mb-3"
                            >
                                <Form.Control type="text" placeholder="GDP" onChange={[updateFormField, 'gdp']} value={form.gdp} />
                            </FloatingLabel>
                            <Show
                                when={isHandling()}
                                fallback={
                                    <Button style={{ width: '13vh' }} type="submit" class="mt-3" variant="dark">Add</Button>
                                }
                            >
                                <Button style={{ width: '13vh' }} disabled="true" onClick={null} class="mt-3" variant="dark"><Spinner animation="border" role="status" variant="light" size="sm" />Handling...</Button>
                            </Show>
                        </form>
                    </Card.Body>
                </Card>
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

export default CountryAdd