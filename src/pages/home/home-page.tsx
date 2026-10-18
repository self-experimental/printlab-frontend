import { env } from '@/shared/config/env';
import { useHomePage } from './hooks/use-home-page';
import { HomeHeader } from './ui/home-header';
import { UploadNotice } from './ui/upload-notice';
import { ModelPanel } from './ui/model-panel';
import { OptimizationForm } from './ui/optimization-form';
import { OptimizationResults } from './ui/optimization-results';
import { SubmittedRequest } from './ui/submitted-request';
import styles from './styles/home-page.module.css';

export function HomePage() {
  const { light, upload, notice, model, optimization, toggleTheme, openUpload, submit, reset } =
    useHomePage();
  return (
    <div className={[styles['home-page'], light ? styles['home-page--light'] : ''].join(' ')}>
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
            fileName={model.fileName}
            loading={model.loading}
            onRemove={model.remove}
          />
          <OptimizationForm loading={model.loading} onSubmit={submit} onChange={reset} />
        </div>
        <OptimizationResults result={optimization.result} />
        {optimization.result && <SubmittedRequest result={optimization.result} />}
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
