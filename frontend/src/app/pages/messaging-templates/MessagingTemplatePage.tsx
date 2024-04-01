/*
 * Notifo.io
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
 */

import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import { NavLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Card, CardBody, Col, Form, Row } from 'reactstrap';
import { FormError, Icon, Loader, Types, useEventCallback } from '@app/framework';
import { Forms } from '@app/shared/components';
import { loadMessagingTemplate, updateMessagingTemplate, useApp, useMessagingTemplates } from '@app/state';
import { texts } from '@app/texts';

type FormValues = { name?: string; primary: boolean; languages: { [key: string]: string } };

export const MessagingTemplatePage = () => {
    const dispatch = useDispatch<any>();
    const app = useApp()!;
    const appId = app.id;
    const appLanguages = app.languages;
    const loadingTemplate = useMessagingTemplates(x => x.loadingTemplate);
    const loadingTemplateError = useMessagingTemplates(x => x.loadingTemplateError);
    const template = useMessagingTemplates(x => x.template);
    const templateId = useParams().templateId!;
    const updating = useMessagingTemplates(x => x.updating);
    const updatingError = useMessagingTemplates(x => x.updatingError);
    const [language, setLanguage] = React.useState(appLanguages[0]);

    React.useEffect(() => {
        dispatch(loadMessagingTemplate({ appId, id: templateId }));
    }, [dispatch, appId, templateId]);

    React.useEffect(() => {
        if (loadingTemplateError) {
            toast.error(loadingTemplateError.response);
        }
    }, [loadingTemplateError]);

    React.useEffect(() => {
        if (updatingError) {
            toast.error(updatingError.response);
        }
    }, [updatingError]);

    const doSave = useEventCallback((values: FormValues) => {
        const update = { ...values, languages: {} as Record<string, any> };

        if (values?.languages) {
            for (const [key, value] of Object.entries(values.languages)) {
                update.languages[key] = { text: value };
            }
        }

        dispatch(updateMessagingTemplate({ appId, id: templateId, update }));
    });

    const form = useForm<FormValues>({ mode: 'onChange' });
    const { reset } = form;

    React.useEffect(() => {
        const result: any = { ...Types.clone(template), languages: {} };

        if (template?.languages) {
            for (const [key, value] of Object.entries(template.languages)) {
                result.languages[key] = value.text;
            }
        }

        form.reset(result);
    }, [template]);

    return (
        <div className='messaging-form'>
            <div className='header'>
                <Row className='align-items-center'>
                    <Col xs='auto'>
                        <Row noGutters className='align-items-center'>
                            <Col xs='auto'>
                                <NavLink className='btn btn-back btn-flat' to='./../'>
                                    <Icon type='keyboard_arrow_left' />
                                </NavLink>
                            </Col>
                            <Col xs='auto'>
                                <h2>{texts.messagingTemplates.singleHeader}</h2>
                            </Col>
                        </Row>
                    </Col>
                    <Col>
                        <Loader visible={loadingTemplate} />
                    </Col>
                </Row>
            </div>

            <FormProvider {...form}>
                <Form onSubmit={form.handleSubmit(doSave)}>
                    <Card>
                        <CardBody>
                            <fieldset disabled={updating}>
                                <Forms.Text name='name'
                                    label={texts.common.name} />

                                <Forms.Boolean name='primary'
                                    label={texts.common.primary} />

                                <Forms.LocalizedTextArea name='languages'
                                    languages={app.languages}
                                    language={language}
                                    onLanguageSelect={setLanguage}
                                    label={texts.common.templates} />
                            </fieldset>

                            <FormError error={updatingError} />

                            <div className='text-right mt-2'>
                                <Button type='submit' color='success' disabled={updating}>
                                    <Loader light small visible={updating} /> {texts.common.save}
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </Form>
            </FormProvider>
        </div>
    );
};
