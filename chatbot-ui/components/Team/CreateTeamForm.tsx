'use client';

import { useTranslation } from '@/app/i18n/client';
import { FC, useEffect, useMemo } from 'react';
import { createTeam, CreateTeam } from '@/app/server_actions/createTeam';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormButton from '@/components/Global/FormButton';
import { useServerState } from '@/components/Provider/ServerStateProvider';
import toast from 'react-hot-toast';
import { error_handler_for_ui } from '@/app/utils/error';

type Props = {
  onSubmit: (team: CreateTeam) => void;
  onCancel: () => void;
};

const CreateTeamForm: FC<Props> = ({ onSubmit, onCancel }) => {
  const { t } = useTranslation('team');

  const { loginUserAttributes, embeddings, authenticationEnabled } =
    useServerState();

  const teamSchema = useMemo(
    () =>
      z.object({
        id: z
          .string()
          .trim()
          .min(1, { message: t<string>('ID cannot be empty.') })
          .max(200, {
            message: t<string>('ID must be 200 or fewer characters length.'),
          })
          .regex(/^[0-9a-z]+$/, {
            message: '',
          }),
        name: z
          .string()
          .trim()
          .min(1, { message: t<string>('Name cannot be empty.') }),
        embedding_model: z.string(),
        country_regex: z.string(),
        company_regex: z.string(),
        department_regex: z.string(),
        title_regex: z.string(),
        email_regex: z.string(),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    resetField,
  } = useForm({
    defaultValues: {
      id: '',
      name: '',
      embedding_model: '',
      country_regex: '',
      company_regex: '',
      department_regex: '',
      title_regex: '',
      email_regex: '',
    },
    resolver: zodResolver(teamSchema),
  });

  useEffect(() => {
    if (embeddings && embeddings[0])
      resetField('embedding_model', { defaultValue: embeddings[0].model_id });
  }, [embeddings, resetField]);

  const onSubmitForm = async (team: CreateTeam) => {
    try {
      const { type, detail } = await createTeam(team);
      if (type === 'success') {
        onSubmit(team);
      } else if (type === 'team-id-already-exists') {
        setError('id', {
          message: t<string>('The ID already exists. Use another one.'),
        });
      } else {
        error_handler_for_ui(t, type, detail);
      }
    } catch (err) {
      if (err instanceof Error) {
          console.error(t('An error occurred in the frontend processing. Please contact the administrator.') + err);
          toast.error(t('An error occurred in the frontend processing. Please contact the administrator.') + err);
      } else {
          console.error(t('An unexpected error occurred. Please contact the administrator.'));
          console.error(err)
          toast.error(t('An unexpected error occurred. Please contact the administrator.'))
      }
    }
  };

  return (
    <>
      <form className="text-neutral-300" onSubmit={handleSubmit(onSubmitForm)}>
        <div className="my-4 flex items-center gap-5">
          <div className="w-2/12 text-right">{t('Team ID')} *</div>
          <div className="w-10/12">
            <input
              type="text"
              className={`w-full rounded-md border-2 bg-chatbot-800 p-2 outline-none ${
                errors.id
                  ? 'border-red-400'
                  : 'border-transparent focus:border-chatbot-600'
              }`}
              {...register('id')}
            />
            <p className="ml-2 mt-3 text-neutral-400">
              {t<string>('ID must be alphanumeric characters.')}
              {errors.id && errors.id.message}
            </p>
          </div>
        </div>

        <div className="my-4 flex items-center gap-5">
          <div className="w-2/12 text-right">{t('Team name')} *</div>
          <div className="w-10/12">
            <input
              type="text"
              className={`w-full rounded-md border-2 bg-chatbot-800 p-2 outline-none ${
                errors.name
                  ? 'border-red-400'
                  : 'border-transparent focus:border-chatbot-600'
              }`}
              {...register('name')}
            />
            <p className="ml-2 mt-3 text-neutral-400">
              {errors.name && errors.name.message}
            </p>
          </div>
        </div>

        <div className="my-4 flex items-center gap-5">
          <div className="w-2/12 text-right">
            <span className="ml-2">{t('Embedding model')}</span>
          </div>
          <div className="w-10/12">
            <select
              className="w-full grid-rows-1 rounded-md border-2 border-transparent bg-chatbot-800 p-2 outline-none focus:border-chatbot-600"
              style={{ gridArea: '1/1' }}
              {...register('embedding_model')}
            >
              {embeddings.map((embedding) => (
                <option key={embedding.model_id} value={embedding.model_id}>
                  {embedding.name} ({embedding.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {authenticationEnabled && (
          <>
            <hr className="my-6 border-chatbot-700" />
            <h3 className="text-base font-semibold text-neutral-300">
              {t('Requirements for participation')}
            </h3>

            <div className="my-4 flex items-center gap-5">
              <div className="w-2/12 text-right">{t('Country')}</div>
              <div className="w-10/12">
                <input
                  type="text"
                  className="w-full rounded-md border-2 border-transparent bg-chatbot-800 p-2 outline-none focus:border-chatbot-600"
                  {...register('country_regex')}
                />
              </div>
            </div>

            <div className="my-4 flex items-center gap-5">
              <div className="w-2/12 text-right">{t('Company')}</div>
              <div className="w-10/12">
                <input
                  type="text"
                  className="w-full rounded-md border-2 border-transparent bg-chatbot-800 p-2 outline-none focus:border-chatbot-600"
                  {...register('company_regex')}
                />
              </div>
            </div>

            <div className="my-4 flex items-center gap-5">
              <div className="w-2/12 text-right">{t('Department')}</div>
              <div className="w-10/12">
                <input
                  type="text"
                  className="w-full rounded-md border-2 border-transparent bg-chatbot-800 p-2 outline-none focus:border-chatbot-600"
                  {...register('department_regex')}
                  placeholder={t('e.g. ') + loginUserAttributes.department}
                />
              </div>
            </div>

            <div className="my-4 flex items-center gap-5">
              <div className="w-2/12 text-right">{t('Title')}</div>
              <div className="w-10/12">
                <input
                  type="text"
                  className="w-full rounded-md border-2 border-transparent bg-chatbot-800 p-2 outline-none focus:border-chatbot-600"
                  {...register('title_regex')}
                  placeholder={t('e.g. ') + loginUserAttributes.title}
                />
              </div>
            </div>

            <div className="my-4 flex items-center gap-5">
              <div className="w-2/12 text-right">{t('Email')}</div>
              <div className="w-10/12">
                <input
                  type="text"
                  className="w-full rounded-md border-2 border-transparent bg-chatbot-800 p-2 outline-none focus:border-chatbot-600"
                  {...register('email_regex')}
                  placeholder={t('e.g. ') + loginUserAttributes.email}
                />
              </div>
            </div>
          </>
        )}

        <div className="my-4 flex items-center justify-end gap-5">
          <div>
            <FormButton type="submit" variant="primary">
              {t('Submit')}
            </FormButton>
          </div>
          <div>
            <FormButton type="button" onClick={onCancel}>
              {t('Cancel')}
            </FormButton>
          </div>
        </div>
      </form>
    </>
  );
};

export default CreateTeamForm;
