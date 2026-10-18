import styles from '../styles/home-page.module.css';

export function ResultSummary() {
  return (
    <div className={styles['home-page__summary']}>
      <h3>Рекомендуемые параметры</h3>
      <div className={styles['home-page__metrics']}>
        <div className={styles['home-page__ring']}>
          <strong>
            40<span>%</span>
          </strong>
        </div>
        <div className={styles['home-page__metric-pair']}>
          <div>
            <span className={styles['home-page__metric-label']}>Ожидаемая прочность</span>
            <strong className={styles['home-page__metric-value']}>215 Н</strong>
            <span className={styles['home-page__metric-badge']}>+15% к требуемой</span>
          </div>
          <div>
            <span className={styles['home-page__metric-label']}>Расход материала</span>
            <strong className={styles['home-page__metric-value']}>28,4 г</strong>
            <span className={styles['home-page__metric-badge']}>−32% от сплошного</span>
          </div>
        </div>
      </div>
      <dl>
        <div>
          <dt>Тип заполнения</dt>
          <dd>Gyroid</dd>
        </div>
        <div>
          <dt>Высота слоя</dt>
          <dd>0,2 мм</dd>
        </div>
        <div>
          <dt>Периметры</dt>
          <dd>3</dd>
        </div>
        <div>
          <dt>Время печати</dt>
          <dd>1 ч 45 мин</dd>
        </div>
      </dl>
      <p className={styles['home-page__form-hint']}>
        Фиксированный пример. Эти цифры не зависят от вашей модели и введённых параметров.
      </p>
    </div>
  );
}
