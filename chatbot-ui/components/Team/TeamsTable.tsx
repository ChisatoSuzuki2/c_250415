import { ChangeEvent, FC, MouseEvent } from 'react';
import { Team } from '@/app/server_actions/getTeams';
import { useTranslation } from '@/app/i18n/client';
import FormButton from '@/components/Global/FormButton';
import { usePagination } from '@/app/hooks/usePagination';
import { useServerState } from '@/components/Provider/ServerStateProvider';

type Props = {
  teams: Team[];
  onViewDetailClick: (team: Team) => void;
};

const TeamsTable: FC<Props> = ({ teams, onViewDetailClick }) => {
  const { t } = useTranslation('team');

  const { authenticationEnabled } = useServerState();

  const {
    currentEntries: currentTeams,
    isFirstPage,
    isLastPage,
    currentPage,
    totalPage,
    moveToFirstPage,
    moveToPreviousPage,
    moveToNextPage,
    moveToLastPage,
    setPerPage,
    perPageList,
  } = usePagination(teams);

  const onClickFirstPage = (e: MouseEvent) => {
    e.preventDefault();

    moveToFirstPage();
  };

  const onClickPrev = (e: MouseEvent) => {
    e.preventDefault();

    moveToPreviousPage();
  };

  const onClickNext = (e: MouseEvent) => {
    e.preventDefault();

    moveToNextPage();
  };

  const onClickLastPage = (e: MouseEvent) => {
    e.preventDefault();

    moveToLastPage();
  };

  const onChangePerPage = (e: ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();

    const newPerPage = Number.parseInt(e.target.value);
    if (Number.isNaN(newPerPage)) return;
    setPerPage(newPerPage);
  };

  return (
    <>
      <table className="w-full text-neutral-300">
        <thead>
          <tr className="border-b-2 border-chatbot-700">
            <td className="p-2 py-4">{t('Team ID')}</td>
            <td className="p-2">{t('Team name')}</td>
            {authenticationEnabled && (
              <td className="p-2">{t("Owner's email")}</td>
            )}
            <td className="p-2"></td>
          </tr>
        </thead>
        <tbody>
          {currentTeams.map((team: Team) => (
            <tr key={team.id} className="border-b border-chatbot-800">
              <td className="p-2 py-4">{team.id}</td>
              <td className="p-2">{team.name}</td>
              {authenticationEnabled && (
                <td className="p-2">{team.owner_email}</td>
              )}
              <td className="p-2 text-right">
                <FormButton
                  type="button"
                  onClick={() => onViewDetailClick(team)}
                >
                  {t('Edit')}
                </FormButton>
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={4} className="py-4">
              <div className="flex w-full justify-between">
                <div>
                  <span className="mx-1">{t('Per page:')}</span>
                  <select
                    className="ml-1 rounded-md border border-chatbot-800 bg-chatbot-800 px-2 py-1 text-neutral-300"
                    name="per-page"
                    id="per-page"
                    onChange={onChangePerPage}
                  >
                    {perPageList.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <FormButton
                    type="button"
                    size="small"
                    onClick={onClickFirstPage}
                    disabled={isFirstPage}
                    className="mr-1"
                  >
                    &lt;&lt;
                  </FormButton>
                  <FormButton
                    type="button"
                    size="small"
                    onClick={onClickPrev}
                    disabled={isFirstPage}
                    className="mr-1"
                  >
                    &lt;
                  </FormButton>
                  <span className="px-2">
                    {t('Page')}: {currentPage + 1} / {totalPage}
                  </span>
                  <FormButton
                    type="button"
                    size="small"
                    onClick={onClickNext}
                    disabled={isLastPage}
                    className="ml-1"
                  >
                    &gt;
                  </FormButton>
                  <FormButton
                    type="button"
                    size="small"
                    onClick={onClickLastPage}
                    disabled={isLastPage}
                    className="ml-1"
                  >
                    &gt;&gt;
                  </FormButton>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default TeamsTable;
