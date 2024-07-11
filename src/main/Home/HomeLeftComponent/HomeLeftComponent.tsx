import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useContext, useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthContext, { AuthContextType } from "../../context/AuthProvider";
import { api } from "../../service/api/endpoint";
import { useNavigate } from "react-router-dom";

type FormFields = {
  projectCode: string;
  startDate: string;
  endDate: string;
};

const HomeLeftComponent = () => {
  // const { auth } = useContext(AuthContext) as AuthContextType;
  const auth = localStorage.getItem("authTokenInstallation");

  const url = auth ? `Bearer ${auth}` : "";
  const headers = {
    Authorization: url,
    accept: "application/json",
    "Content-Type": "application/json",
  };
  const generateInvoiceFormRef = useRef(null);
  const navigation = useNavigate();

  const [listYear, setListYear] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [listProjectCode, setListProjectCode] = useState<string[]>([]);
  const [selectedProjectCode, setSelectedProjectCode] = useState<string>("");
  const [listSerialNumber, setListSerialNumber] = useState<string[]>([]);
  const [selectedSerialNumber, setSelectedSerialNumber] = useState<number[]>(
    []
  );
  const [isShowImage, setIsShowImage] = useState<boolean>(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(
    new Date()
  );
  const [filteredStartDate, setFilteredStartDate] = useState<string>("");

  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(
    new Date()
  );
  const [filteredEndDate, setFilteredEndDate] = useState<string>("");
  const [listError, setListError] = useState<FormFields>({
    projectCode: "",
    startDate: "",
    endDate: "",
  });
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [dataDetailGenerateInvoice, setDataDetailGenerateInvoice] =
    useState<any>();
  const [isFirstLoadToasty, setIsFirstLoadToasty] = useState<boolean>(false);
  const [filterDateStartForInvoice, setFilterDateStartForInvoice] =
    useState<string>("");
  const [filterDateEndForInvoice, setFilterDateEndForInvoice] =
    useState<string>("");
  const updateFieldError = (fieldName: string, error: string) => {
    setListError((prevErrrors) => ({
      ...prevErrrors,
      [fieldName]: error,
    }));
  };

  const validateFields = () => {
    // Validation logic for each field
    updateFieldError(
      "projectCode",
      selectedProjectCode?.trim() ? "" : "Field Project code is required."
    );

    updateFieldError(
      "startDate",
      !filteredStartDate.trim() ? "Field Start date is required." : ""
    );
    updateFieldError(
      "endDate",
      !filteredEndDate.trim() ? "Field end date is required." : ""
    );
  };

  const fetchDataLogistic = async () => {
    try {
      return await axios
        .get(api.getInstallationsSerialNumber, { headers })
        .then((res) => res.data);
    } catch (error) {
      return { error: "Failed to fetch data" };
    }
  };

  const { data: dataTotalProduct } = useQuery({
    queryKey: ["dataTotalProduct"],
    queryFn: () => fetchDataLogistic(),
    enabled: !!auth,
  });

  // fetch data project code without years
  const fetchDataInstallationListOfProjectCode = async () => {
    try {
      return await axios
        .get(api.getInstallationsGetListProjectCode, { headers })
        .then((res) => res.data);
    } catch (error) {
      return { error: "Failed to fetch data" };
    }
  };

  const { data: dataInstallationListOfProjectCode } = useQuery({
    queryKey: ["dataInstallationListOfProjectCode"],
    queryFn: () => fetchDataInstallationListOfProjectCode(),
    enabled: !!auth,
  });

  useEffect(() => {
    if (dataInstallationListOfProjectCode) {
      const listNewSerialNumber = dataInstallationListOfProjectCode?.project
        ?.filter((item: any) => item["project_code"] === selectedProjectCode)[0]
        ?.details?.map((item: any) => item["serials"])
        .flat()
        .map((item: any) => item["serial"])
        .filter((item: any, i: any, ar: any) => ar.indexOf(item) === i);
    }
  }, [selectedProjectCode]);

  // Set Select year
  useEffect(() => {
    if (dataTotalProduct?.founds) {
      const years = dataTotalProduct?.founds
        .map((item: object) => item["year"])
        .filter(
          (item: any, i: any, ar: string | any[]) => ar.indexOf(item) === i
        )
        .sort();

      setListYear(years);
    }
  }, [dataTotalProduct]);

  // Set Select project code
  useEffect(() => {
    if (dataTotalProduct?.founds && selectedYear) {
      const projects = dataTotalProduct?.founds
        .filter((item: any) => item["year"] === selectedYear)
        .map((item: string) =>
          item["projects"].map((a: any) => a["project_code"])
        )
        .flat();

      projects.sort((a: string, b: string) => {
        return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
      });

      setListProjectCode(projects);
    } else {
      const newData = dataInstallationListOfProjectCode?.project?.map(
        (item: object) => item["project_code"]
      );

      setListProjectCode(newData);
    }
    setSelectedProjectCode("");
    setSelectedSerialNumber([]);
  }, [selectedYear, dataInstallationListOfProjectCode]);

  // set Serial number
  useEffect(() => {
    if (dataTotalProduct?.founds && selectedYear) {
      const filteredData = dataTotalProduct?.founds
        .filter((found: any) => found.year === selectedYear)[0]
        ?.projects.filter(
          (project: any) => project.project_code === selectedProjectCode
        )
        .map((project: any) => project.serial_number)[0]; // map to serial_number
      setListSerialNumber(filteredData);
    } else {
      const listNewSerialNumber = dataInstallationListOfProjectCode?.project
        ?.filter((item: any) => item["project_code"] === selectedProjectCode)[0]
        ?.details?.map((item: any) => item["serials"])
        .flat()
        .map((item: any) => item["serial"])
        .filter((item: any, i: any, ar: any) => ar.indexOf(item) === i);

      setListSerialNumber(listNewSerialNumber);
    }
  }, [selectedProjectCode, dataInstallationListOfProjectCode]);

  // function handle get serial number
  const handleGetSerialNumber = (event: any) => {
    const { value, checked } = event.target;
    if (checked) {
      setSelectedSerialNumber([...selectedSerialNumber, Number(value)]);
    } else {
      setSelectedSerialNumber(
        selectedSerialNumber.filter((item) => Number(item) !== Number(value))
      );
    }
  };

  const _filterStartDate = (date: Date | null) => {
    setSelectedStartDate(date);
    setFilteredStartDate(
      date?.getFullYear() +
        "-" +
        ((date?.getMonth() as number) + 1) +
        "-" +
        date?.getDate()
    );
    setFilterDateStartForInvoice(
      date?.getDate() +
        "-" +
        ((date?.getMonth() as number) + 1) +
        "-" +
        date?.getFullYear()
    );
  };

  const _filterEndDate = (date: Date | null) => {
    setSelectedEndDate(date);
    setFilteredEndDate(
      date?.getFullYear() +
        "-" +
        ((date?.getMonth() as number) + 1) +
        "-" +
        date?.getDate()
    );
    setFilterDateEndForInvoice(
      date?.getDate() +
        "-" +
        ((date?.getMonth() as number) + 1) +
        "-" +
        date?.getFullYear()
    );
  };

  // React-toast
  const notify = () =>
    toast.error("No products found !, please select again.", {
      position: "top-left",
    });

  const handleUpdateInstallation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    validateFields();
    const payload = selectedSerialNumber;
    if (!!selectedProjectCode && !!filteredStartDate && !!filteredEndDate) {
      setIsSubmitted(true);
      try {
        axios
          .post(
            api.postInstallations(
              selectedProjectCode,
              filteredStartDate,
              filteredEndDate,
              isShowImage
            ),
            payload,
            { headers }
          )
          .then((res) => {
            setIsSubmitted(false);
            setIsFirstLoadToasty(true);
            setDataDetailGenerateInvoice(res.data);
          });
      } catch (error) {
        setIsSubmitted(false);
        setIsFirstLoadToasty(true);
        console.log({ error });
      }
    }
  };

  useEffect(() => {
    if (dataDetailGenerateInvoice?.details.length > 0) {
      setIsFirstLoadToasty(false);
      navigation("/Invoice", {
        state: {
          dataDetailGenerateInvoice,
          filterDateStartForInvoice,
          filterDateEndForInvoice,
          isShowImage,
        },
      });
    } else {
      isFirstLoadToasty && notify();
    }
  }, [dataDetailGenerateInvoice]);

  return (
    <form
      ref={generateInvoiceFormRef}
      className="flex flex-col gap-5 mb-7 p-7 border-2 rounded-2xl shadow-2xl w-full md:min-w-[400px] bg-white"
      onSubmit={(event) => handleUpdateInstallation(event)}
    >
      <ToastContainer />
      <div className="flex justify-between items-center">
        <img
          className="w-[500px]"
          src={require("../../../assets/images/logo1.png")}
          alt="logo"
        />
      </div>
      <div className="grid gap-5">
        <div className="space-y-3">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Year
            </label>
            <select
              name="selectedYeaer"
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
              className="select select-bordered w-full"
            >
              <option disabled value="">
                Please select a Year
              </option>
              {listYear.map((item, index) => (
                <option value={`${item}`} key={index}>{`${item}`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Project code
            </label>
            <Select
              className="basic-single"
              classNamePrefix="select"
              placeholder="Select or Search Project code"
              isDisabled={false}
              isClearable={false}
              isSearchable={true}
              name="projectCode"
              onChange={(event) => {
                setSelectedProjectCode(event!.value);
                updateFieldError("projectCode", "");
              }}
              options={listProjectCode?.map((item: string) => ({
                value: item,
                label: item,
              }))}
              value={
                selectedProjectCode
                  ? { value: selectedProjectCode, label: selectedProjectCode }
                  : null
              }
            />
            {listError.projectCode && (
              <p className="text-red-500">{listError.projectCode}</p>
            )}
          </div>
          {selectedProjectCode && (
            <div>
              <fieldset>
                <legend className="block text-gray-700 text-sm font-bold mb-2">
                  Serial Number
                </legend>
                <div>
                  <div className="flex flex-wrap gap-3">
                    {listSerialNumber?.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="checkbox"
                          name="serial"
                          value={item}
                          onChange={(event) => handleGetSerialNumber(event)}
                        />
                        <span className="label-text">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </fieldset>
            </div>
          )}
          {/* Start Date */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Start Date
            </label>
            <DatePicker
              className="input input-bordered w-full"
              selected={selectedStartDate}
              onChange={(date) => {
                _filterStartDate(date);
                updateFieldError("startDate", "");
              }}
              placeholderText="yyyy/mm/dd"
              dateFormat="yyyy/MM/dd"
            />
          </div>
          {listError.startDate && (
            <p className="text-red-500">{listError.startDate}</p>
          )}

          {/* End Date */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              End Date
            </label>
            <DatePicker
              className="input input-bordered w-full"
              selected={selectedEndDate}
              onChange={(date) => {
                _filterEndDate(date);

                updateFieldError("endDate", "");
              }}
              placeholderText="yyyy/mm/dd"
              dateFormat="yyyy/MM/dd"
            />
          </div>
          {listError.endDate && (
            <p className="text-red-500">{listError.endDate}</p>
          )}

          {/* Show Image */}
          <div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="checkbox"
                name="serial"
                onChange={(e) => setIsShowImage(e.target.checked)}
              />
              <span className="label-text">Show Image</span>
            </div>
          </div>
        </div>
      </div>
      <button
        type="submit"
        className={`btn btn - primary 
      ${isSubmitted && "loading"}
      
      `}
      >
        Generate Installation
      </button>
    </form>
  );
};

export default HomeLeftComponent;
