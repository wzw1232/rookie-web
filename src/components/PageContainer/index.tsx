import { PageContainer as ProPageContainer } from '@ant-design/pro-components';
import type { PageContainerProps } from '@ant-design/pro-components';

const PageContainer: React.FC<PageContainerProps> = (props) => {
  return (
    <ProPageContainer
      {...props}
      header={{
        breadcrumb: {},
        ...props.header,
      }}
    />
  );
};

export default PageContainer;
