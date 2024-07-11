import { BASE_URL } from "./BaseUrl";

export const api = {
  getLogin: `${BASE_URL}/auth/sign-in`,

  // Logistic
  getDataProduct: (
    currentPage?: number,
    searchValue?: string,
    signed?: string
  ) =>
    `${BASE_URL}/logistic?page=${currentPage}&delivery_order_ref_or_company_search=${searchValue?.toUpperCase()}&signed=${signed}`,
  getDataProductDetail: (productId: number) =>
    `${BASE_URL}/logistic/${productId}`,

  // Installations
  getDataInvoices: (currentPage?: number, searchValue?: string) =>
    `${BASE_URL}/installations?page=${currentPage}&project_code_or_serial_no=${searchValue}`,
  getDataInvoicesDetail: (serialNo: number) =>
    `${BASE_URL}/installations${serialNo}`,

  getInstallationsSerialNumber: `${BASE_URL}/installations/get-serial-number`,

  getInstallationsGetListProjectCode: `${BASE_URL}/installations/get-list-of-project-by-date`,

  postInstallations: (
    project_request: string,
    start_date: string,
    end_date: string,
    show_image: boolean
  ) =>
    `${BASE_URL}/installations/gen-installation-report?project_request=${project_request}&start_date=${start_date}&end_date=${end_date}&show_image=${show_image}`,
};
