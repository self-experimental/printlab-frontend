import { NativeSelect } from '@mantine/core';
import { env } from '@/shared/config/env';
import { useHomePage } from './hooks/use-home-page';
import { HomeHeader } from './ui/home-header';
import { UploadNotice } from './ui/upload-notice';
import { ModelPanel } from './ui/model-panel';
import { OptimizationForm } from './ui/optimization-form';
import { OptimizationResults } from './ui/optimization-results';
import { SubmittedRequest } from './ui/submitted-request';
import { PrintPlanForm } from './ui/print-plan-form';
import { PrintPlanResults } from './ui/print-plan-results';
import styles from './styles/home-page.module.css';

export function HomePage() {
  const {
    light,
    upload,
    notice,
    model,
    optimization,
    printPlan,
    mode,
    changeMode,
    toggleTheme,
    openUpload,
    submit,
    reset,
  } = useHomePage();
  return (
    <div className={styles['home-page']}>
      <HomeHeader
        light={light}
        loading={model.loading}
        onToggleTheme={toggleTheme}
        onUpload={openUpload}
      />
      <main id="main-content" className={styles['home-page__main']}>
        <div className={styles['home-page__intro']}>
          <div>
            <p className={styles['home-page__eyebrow']}>PRINTLAB / РАБОЧЕЕ ПРОСТРАНСТВО</p>
            <h1>
              Меньше материала.
              <br className={styles['home-page__mobile-break']} /> Больше возможностей.
            </h1>
          </div>
        </div>
        <input
          ref={upload}
          id="stl-upload"
          className={styles['home-page__file-input']}
          type="file"
          accept=".stl"
          aria-label="Выберите STL-модель"
          disabled={model.loading}
          onChange={(event) => {
            void model.readFile(event);
          }}
        />
        <UploadNotice
          error={notice.error}
          message={notice.message}
          visible={notice.visible}
          onClose={notice.close}
        />
        <div className={styles['home-page__workspace']}>
          <ModelPanel
            model={model.model}
            file={model.file}
            fileName={model.fileName}
            loading={model.loading}
            onRemove={model.remove}
          />
          <div className={styles['home-page__calculation-panel']}>
            <NativeSelect
              className={styles['home-page__mode']}
              label="Режим расчёта"
              aria-label="Режим расчёта"
              value={mode}
              onChange={(event) => {
                changeMode(event.currentTarget.value === 'LOAD' ? 'LOAD' : 'PRINT');
              }}
            >
              <option value="PRINT">Параметры печати · A1 mini</option>
              <option value="LOAD">Нагрузка по испытаниям образцов</option>
            </NativeSelect>
            {mode === 'PRINT' ? (
              <PrintPlanForm
                loading={model.loading || printPlan.loading}
                hasModel={Boolean(model.file)}
                calculated={Boolean(printPlan.result)}
                onSubmit={submit}
                onChange={reset}
              />
            ) : (
              <OptimizationForm
                loading={model.loading || optimization.loading}
                hasModel={Boolean(model.file)}
                calculated={Boolean(optimization.result)}
                onSubmit={submit}
                onChange={reset}
              />
            )}
          </div>
        </div>
        {mode === 'PRINT' ? (
          <PrintPlanResults
            result={printPlan.result}
            loading={printPlan.loading}
            error={printPlan.error}
          />
        ) : (
          <OptimizationResults
            result={optimization.result}
            loading={optimization.loading}
            error={optimization.error}
          />
        )}
        {mode === 'LOAD' && optimization.result && (
          <SubmittedRequest result={optimization.result} />
        )}
      </main>
      <footer className={styles['home-page__footer']}>
        <span>
          {env.appName} <span aria-hidden="true">/</span> Print Lab
        </span>
        <span>Исследовательский проект · прототип интерфейса</span>
      </footer>
    </div>
  );
}
