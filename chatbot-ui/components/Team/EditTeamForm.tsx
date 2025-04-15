'use client';

import { useTranslation } from '@/app/i18n/client';
import { FC, useMemo, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Team } from '@/app/server_actions/getTeams';
import { UpdateTeam, updateTeam } from '@/app/server_actions/updateTeam';
import { deleteTeam } from '@/app/server_actions/deleteTeam';
import toast from 'react-hot-toast';
import { Spinner } from '@/components/Global/Spinner';
import FormButton from '@/components/Global/FormButton';
import { useServerState } from '@/components/Provider/ServerStateProvider';
import { error_handler_for_ui } from '@/app/utils/error';

type Props = {
  onDelete: () => void;
  onCancel: () => void;
  team: Team;
};

const CreateTeamForm: FC<Props> = ({ onDelete, onCancel, team }) => {
  const { t } = useTranslation('team');

  const { embeddings, authenticationEnabled } = useServerState();
  const embedding = embeddings.find((e) => e.model_id === team.embedding_model);

  const teamSchema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .trim()
          .min(1, { message: t<string>('Name cannot be empty.') }),
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
  } = useForm({
    defaultValues: team as UpdateTeam,
    resolver: zodResolver(teamSchema),
  });

  const [updating, setUpdating] = useState(false);

  const onSubmitForm = async (newTeam: UpdateTeam) => {
    try {
      setUpdating(true);
      const { type, detail } = await updateTeam(team.id, newTeam);

      if (type === 'success') {
        toast.success(t('Update team successfully.'));
      } else {
        error_handler_for_ui(t, type, detail);
      }
    } finally {
      setUpdating(false);
    }
  };

  const onDeleteClick = async (team: Team) => {
    if (!confirm(t<string>('Are you sure you want to delete this team?'))) {
      return
    }

    try {
      const { type } = await deleteTeam(team.id);

      if (type === 'forbidden')
        toast.error(
            t('Could not delete the team. Only team members can delete.'),
        );

      if (type === 'success') {
        onDelete();
      } else {
        console.error(t('An error occurred on the backend. Please contact the administrator.'))
        toast.error(t('An error occurred on the backend. Please contact the administrator.'))
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error(t('An error occurred in the frontend processing. Please contact the administrator.'));
        console.error(err)
        toast.error(t('An error occurred in the frontend processing. Please contact the administrator.'));
      } else {
        console.error(t('An unexpected error occurred. Please contact the administrator.'));
        console.error(err)
        toast.error(t('An unexpected error occurred. Please contact the administrator.'))
      }
    }
  };

  return (
    <>
      <div className="grid">
        <form
          className="text-neutral-300"
          onSubmit={handleSubmit(onSubmitForm)}
          style={{ gridArea: '1/1' }}
        >
          <div className="my-4 flex items-center gap-5">
            <div className="w-2/12 text-right">{t('Team ID')}</div>
            <div className="w-10/12">
              <input
                type="text"
                className="w-full rounded-md border-2 border-transparent p-2 outline-none focus:border-chatbot-600 disabled:bg-chatbot-800 disabled:text-neutral-400"
                disabled
                value={team.id}
              />
              <p className="ml-2 mt-3 text-neutral-400">
                {t('ID cannot be changed.')}
              </p>
            </div>
          </div>

          <div className="my-4 flex items-center gap-5">
            <div className="w-2/12 text-right">{t('Team name')}</div>
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
              <div className="grid w-full">
                <select
                  className="w-full grid-rows-1 rounded-md border-2 border-transparent p-2 outline-none focus:border-chatbot-600 disabled:bg-chatbot-800 disabled:text-neutral-400"
                  style={{ gridArea: '1/1' }}
                  value={team.embedding_model}
                  disabled
                >
                  <option value={team.embedding_model}>
                    {embedding
                      ? embedding.name + ` (${embedding.type})`
                      : t('"{{id}}" is not deployed.', {
                          id: team.embedding_model,
                        })}
                  </option>
                </select>
              </div>
              <p className="ml-2 mt-3 text-neutral-400">
                {t('Embedding cannot be changed.')}
              </p>
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
                  />
                </div>
              </div>
            </>
          )}

          <div className="my-4 flex items-center justify-end gap-5">
            <div className="flex-1">
              <FormButton
                type="button"
                variant="danger"
                onClick={() => onDeleteClick(team)}
              >
                {t('Delete team')}
              </FormButton>
            </div>
            <div>
              <FormButton type="submit" variant="primary">
                {t('Save')}
              </FormButton>
            </div>
            <div>
              <FormButton type="button" onClick={onCancel}>
                {t('Cancel')}
              </FormButton>
            </div>
          </div>
        </form>
        <div
          className={`h-full w-full bg-chatbot-950 bg-opacity-50 text-center ${
            updating ? 'grid place-items-center' : 'hidden'
          }`}
          style={{ gridArea: '1/1' }}
        >
          <Spinner className="inline-block" />
        </div>
      </div>
    </>
  );
};

export default CreateTeamForm;
